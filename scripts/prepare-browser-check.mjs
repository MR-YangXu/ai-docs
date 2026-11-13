import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { catalog } from "../catalog/components.mjs";

// 生成临时浏览器验收页，不加入导航，不作为源文件或产品页面提交。
const target = resolve(process.argv[2] || ".vitepress/dist/demos");
await mkdir(target, { recursive: true });
const cases = catalog.flatMap((entry) =>
  entry.demos.map((demo) => ({ stack: entry.stack, id: demo.id }))
);
await writeFile(
  resolve(target, "check.html"),
  `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>示例加载验收</title>
<style>body{font:14px system-ui;margin:24px}iframe{width:100%;height:480px;border:1px solid #ddd}li{line-height:1.6}.fail{color:#c21}</style>
<h1>全部示例加载检查</h1><button id="run">开始检查</button><p id="status" role="status">待运行 · ${
    cases.length
  } 个示例</p><ol id="results"></ol><div id="preview"></div>
<script type="module">
const cases=${JSON.stringify(cases)};
const button=document.querySelector('#run'),status=document.querySelector('#status'),results=document.querySelector('#results'),preview=document.querySelector('#preview');
button.onclick=async()=>{
 button.disabled=true;results.replaceChildren();let failures=0;
 for(const [index,item] of cases.entries()){
  status.textContent='正在检查 '+(index+1)+' / '+cases.length+' · '+item.stack+'/'+item.id;
  const frame=document.createElement('iframe');frame.title=item.stack+'/'+item.id;
  const result=await new Promise(resolve=>{
   let timer,settle;const errors=[];
   const finish=()=>{clearTimeout(timer);clearTimeout(settle);window.removeEventListener('message',receive);
    const doc=frame.contentDocument;const root=doc?.querySelector('#app');
    const alert=root?.getAttribute('role')==='alert';
    if(!root?.textContent.trim())errors.push('根节点为空');
    if(alert)errors.push(root.textContent);
    resolve([...new Set(errors)]);
   };
   const receive=event=>{if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.channel!=='ai-doc-demo')return;
    if(event.data.type==='error')errors.push(event.data.message);
    if(event.data.type==='ready'||event.data.type==='error'){clearTimeout(settle);settle=setTimeout(finish,700);}
   };
   window.addEventListener('message',receive);
   timer=setTimeout(()=>{errors.push('加载超时');finish();},15000);
   frame.src='./'+item.stack+'/index.html?demo='+item.id;
   preview.replaceChildren(frame);
  });
  const line=document.createElement('li');line.textContent=item.stack+'/'+item.id+' · '+(result.length?'失败：'+result.join('；'):'通过');
  if(result.length){failures++;line.className='fail';}results.append(line);
 }
 preview.replaceChildren();status.textContent='检查完成：'+(cases.length-failures)+' / '+cases.length+' 通过，'+failures+' 失败';button.disabled=false;
};
</script></html>`
);
console.log(`浏览器验收页：${target}/check.html`);
