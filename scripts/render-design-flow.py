"""生成文档设计图与可编辑 draw.io 源文件；仅使用 Python 标准库。"""
from html import escape
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/public/diagrams'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1680, 1310
nodes = []
edges = []


def node(id, x, y, w, h, lines, fill='#ffffff', sizes=None, align='center', border=True):
    nodes.append(dict(id=id, x=x, y=y, w=w, h=h, lines=lines, fill=fill,
                      sizes=sizes or [22] + [18] * (len(lines) - 1), align=align, border=border))


def edge(id, points, dashed=False):
    edges.append(dict(id=id, points=points, dashed=dashed))


def label(id, x, y, w, h, lines, sizes=None, align='left'):
    node(id, x, y, w, h, lines, 'none', sizes, align, False)


label('title', 48, 30, 1584, 48, ['AI Code · 从规则到代码的设计流程'], [36])
label('subtitle', 48, 84, 1584, 32, ['规则装进项目 → AI 按约定实现 → 核对代码与检查结果 → 修正与维护'], [22])

# 三个区域借鉴既有图的分层结构，包资产、项目资产与 AI 执行分别呈现。
node('package-zone', 48, 150, 410, 784, [], '#eef5fc')
node('project-zone', 550, 150, 550, 784, [], '#f4f6f8')
node('agent-zone', 1150, 150, 482, 784, [], '#f2effb')
node('review-zone', 48, 1000, 1584, 232, [], '#fff9ea')
label('package-heading', 72, 166, 362, 44, ['01  规则资产 · npm 包'], [25])
label('project-heading', 574, 166, 502, 44, ['02  项目接入 · 业务仓库'], [25])
label('agent-heading', 1174, 166, 434, 44, ['03  日常 AI 开发 · Cursor'], [25])
label('review-heading', 72, 1012, 1100, 44, ['04  验证与反馈 · 用实际结果闭环'], [25])

node('base-rules', 72, 230, 362, 78, ['基础规则 · content/core.md', '阅读范围 · 实现约束 · 验收要求'])
node('skill-library', 72, 330, 362, 274, [], '#e4f2df')
label('skills-heading', 90, 341, 326, 34, ['Skills · 按任务选择的技能'], [22])
skill_rows = [
    [('api · 接口', 154), ('constant · 常量', 162)],
    [('view · 页面', 154), ('component · 组件', 162)],
    [('hook · 组合式函数', 324)],
    [('route · 路由', 154), ('state · 状态', 162)],
    [('i18n 国际化 · type 类型', 324)],
]
for row_index, row in enumerate(skill_rows):
    x = 90
    for col_index, (name, width) in enumerate(row):
        node(f'skill-{row_index}-{col_index}', x, 386 + 39 * row_index, width, 31, [name], sizes=[17])
        x += width + 8
node('scenarios', 72, 626, 362, 82, ['场景补充', 'admin · 后台 / mobile-h5 · 移动端'])
node('profile-template', 72, 730, 362, 82, ['项目档案模板', '通用 / 后台 / 移动端 · 可选'])
label('package-note', 72, 831, 362, 80, ['规则由包维护', '升级包后执行 sync，同步受控文件'], [21, 18])

node('init', 574, 230, 502, 96, ['ai-code init · 初始化', '已有 Vue 3 + Vite + TypeScript 项目', '选择场景 → 按需创建项目档案'], sizes=[22, 18, 18])
node('rule-files', 574, 356, 502, 88, ['基础规则 + 九个通用技能 + 所选场景', '.cursor/rules/  ·  .cursor/skills/'], sizes=[21, 18])
node('config-file', 574, 462, 502, 78, ['.ai-code/config.json', '保存选择、版本、检查脚本与受控清单'])
node('profile-file', 574, 558, 502, 96, ['.ai-code/profile.md · 团队维护', '核对源码 → 填写复用入口 → 人工审查', '可选创建；已有档案不会被 init / sync 覆盖'], sizes=[22, 18, 17])
node('existing-library', 574, 706, 502, 140, [], '#e4f2df')
label('existing-heading', 594, 716, 462, 34, ['项目现有能力 · 从业务源码核实'], [22])
for i, text in enumerate(['公共组件', 'Hook / 逻辑', '请求层', '常量 / 类型', '路由 / 状态', '主题 / 工具']):
    node(f'reuse-{i}', 594 + (i % 3) * 157, 764 + (i // 3) * 38, 146, 30, [text], sizes=[18])
label('project-note', 574, 859, 502, 48, ['安装规则与检查入口；业务能力沿用当前项目'], [18])

node('task-input', 1174, 230, 434, 78, ['输入需求与验收标准', '截图 · 交互 · 已确认的接口事实'])
node('read-context', 1174, 352, 434, 108, ['按任务读取上下文', '基础规则 + profile + 当前源码', '后台读 admin，其他页面读 view'], sizes=[22, 19, 18])
node('plan', 1174, 510, 434, 78, ['规划', '确认拟改文件、复用入口与待确认项'])
node('implement', 1174, 628, 434, 86, ['实现', '复用已有能力，按规则写代码'])
node('code-output', 1174, 756, 434, 90, ['生成或修改业务代码', '页面 · 配置 · API · 常量 · 类型'])
label('agent-note', 1174, 859, 434, 48, ['执行者是 AI；本图不表示已读取全部技能'], [18])

node('checks', 1174, 1070, 434, 108, ['检查与验收', '改动文件 lint · 相关类型检查', 'ai:check（按配置）· 业务行为验收'], sizes=[22, 19, 18])
node('evidence', 666, 1070, 394, 108, ['规则与代码对照', 'Skill 原文 → 源码位置', '实际结果 → 尚未验证的事项'], sizes=[22, 19, 19])
node('delivery', 72, 1070, 480, 108, ['交付与维护', '说明完成内容、复用来源、检查结果', '入口或约定变化后，更新项目档案'], sizes=[22, 19, 19])

# 主流程：安装、上下文输入、生成、验证、交付。
edge('install-edge', [(458, 269), (574, 269)])
label('install-label', 464, 229, 102, 32, ['按需安装'], [18], 'center')
edge('write-files', [(825, 326), (825, 356)])
label('write-label', 842, 325, 120, 30, ['写入项目'], [17])
edge('input-to-read', [(1391, 308), (1391, 352)])
edge('project-to-read', [(1100, 406), (1174, 406)])
label('context-label', 1103, 366, 68, 28, ['约束'], [17], 'center')
edge('read-to-plan', [(1391, 460), (1391, 510)])
edge('plan-to-implement', [(1391, 588), (1391, 628)])
edge('reuse-to-implement', [(1076, 780), (1128, 780), (1128, 671), (1174, 671)])
label('reuse-label', 1105, 721, 66, 30, ['复用'], [17], 'center')
edge('implement-to-code', [(1391, 714), (1391, 756)])
edge('code-to-check', [(1391, 846), (1391, 857), (1620, 857), (1620, 960), (1391, 960), (1391, 1070)])
edge('check-to-evidence', [(1174, 1124), (1060, 1124)])
label('check-result-label', 1067, 1085, 100, 30, ['记录结果'], [17], 'center')
edge('evidence-to-delivery', [(666, 1124), (552, 1124)])
label('deliver-label', 558, 1085, 102, 30, ['明确结论'], [17], 'center')

# 虚线：问题回到实现，项目事实回到档案；不是自动发版流程。
edge('fix-loop', [(1608, 1124), (1654, 1124), (1654, 671), (1608, 671)], True)
label('fix-label', 1450, 966, 196, 28, ['发现问题 → 修正复验'], [17], 'center')
edge('profile-loop', [(312, 1070), (312, 964), (564, 964), (564, 606), (574, 606)], True)
label('profile-loop-label', 315, 935, 232, 29, ['维护项目事实与约定'], [17], 'center')
edge('verify-source', [(825, 706), (825, 654)], True)
label('source-label', 842, 665, 220, 30, ['从源码核实并填写'], [17])

label('legend', 72, 1189, 1500, 28, ['实线：主流程与依赖关系     虚线：修正、核实与维护     检查按任务和项目配置执行，不表示全部自动通过'], [17])
label('source-footer', 48, 1254, 1584, 30, ['依据：ai-doc 文档 + ai-code 0.5.0 源码（提交 a58c709）｜适用：Vue 3 + Vite + TypeScript｜核对：2026-10-10'], [18])

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
       '<title id="title">AI Code 从规则到代码的设计流程</title>',
       '<desc id="desc">左侧规则包向 Vue 3 项目安装通用技能与选定场景。中间的基础规则、技能、档案和源码指导右侧 AI 规划与实现。生成结果经过检查和规则对照，问题回到实现，项目变化更新档案。</desc>',
       '<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e7ebf0" stroke-width="0.6"/></pattern>',
       '<marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#53647a"/></marker>',
       '<marker id="feedback" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#986927"/></marker></defs>',
       '<rect width="100%" height="100%" fill="#ffffff"/><rect width="100%" height="100%" fill="url(#grid)"/>',
       '<g font-family="PingFang SC, Microsoft YaHei, Noto Sans CJK SC, Arial, sans-serif" fill="#263448">']

mxfile = ET.Element('mxfile', host='app.diagrams.net', type='device')
diagram = ET.SubElement(mxfile, 'diagram', id='ai-code-design', name='AI Code 设计流程')
model = ET.SubElement(diagram, 'mxGraphModel', dx=str(W), dy=str(H), grid='1', gridSize='12', guides='1', tooltips='1', connect='1', arrows='1', fold='1', page='1', pageScale='1', pageWidth=str(W), pageHeight=str(H), math='0', shadow='0')
mxroot = ET.SubElement(model, 'root')
ET.SubElement(mxroot, 'mxCell', id='0')
ET.SubElement(mxroot, 'mxCell', id='1', parent='0')

for n in nodes:
    x, y, w, h = [n[k] for k in ('x', 'y', 'w', 'h')]
    if n['fill'] != 'none':
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{n["fill"]}" stroke="#6d7b8c" stroke-width="1.4"/>')
    if n['lines']:
        heights = [s + 10 for s in n['sizes']]
        cursor = y + (h - sum(heights)) / 2
        for i, (line, size, line_height) in enumerate(zip(n['lines'], n['sizes'], heights)):
            tx = x + w / 2 if n['align'] == 'center' else x
            anchor = 'middle' if n['align'] == 'center' else 'start'
            weight = '600' if i == 0 and size >= 21 else '400'
            svg.append(f'<text x="{tx}" y="{cursor + size}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(line)}</text>')
            cursor += line_height
    value = '<br>'.join(f'<span style="font-size:{size}px">{escape(line)}</span>' for line, size in zip(n['lines'], n['sizes']))
    style = f'rounded=0;whiteSpace=wrap;html=1;fillColor={n["fill"]};strokeColor={"#6d7b8c" if n["border"] else "none"};strokeWidth=1.4;align={n["align"]};verticalAlign=middle;fontFamily=PingFang SC;fontColor=#263448;spacing=0;'
    cell = ET.SubElement(mxroot, 'mxCell', id=n['id'], value=value, style=style, vertex='1', parent='1')
    ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h), **{'as': 'geometry'})

connections = {
    'install-edge': ('package-zone', 'init'),
    'write-files': ('init', 'rule-files'),
    'input-to-read': ('task-input', 'read-context'),
    'project-to-read': ('project-zone', 'read-context'),
    'read-to-plan': ('read-context', 'plan'),
    'plan-to-implement': ('plan', 'implement'),
    'reuse-to-implement': ('existing-library', 'implement'),
    'implement-to-code': ('implement', 'code-output'),
    'code-to-check': ('code-output', 'checks'),
    'check-to-evidence': ('checks', 'evidence'),
    'evidence-to-delivery': ('evidence', 'delivery'),
    'fix-loop': ('checks', 'implement'),
    'profile-loop': ('delivery', 'profile-file'),
    'verify-source': ('existing-library', 'profile-file'),
}
node_by_id = {n['id']: n for n in nodes}
for e in edges:
    points = e['points']
    color = '#986927' if e['dashed'] else '#53647a'
    marker = 'feedback' if e['dashed'] else 'arrow'
    dash = ' stroke-dasharray="7 5"' if e['dashed'] else ''
    coords = ' '.join(f'{x},{y}' for x, y in points)
    svg.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="2"{dash} marker-end="url(#{marker})"/>')
    source_id, target_id = connections[e['id']]
    source_node, target_node = node_by_id[source_id], node_by_id[target_id]
    exit_x = (points[0][0] - source_node['x']) / source_node['w']
    exit_y = (points[0][1] - source_node['y']) / source_node['h']
    entry_x = (points[-1][0] - target_node['x']) / target_node['w']
    entry_y = (points[-1][1] - target_node['y']) / target_node['h']
    style = f'edgeStyle=none;rounded=0;endArrow=block;endFill=1;strokeColor={color};strokeWidth=2;dashed={int(e["dashed"])};exitX={exit_x};exitY={exit_y};exitPerimeter=0;entryX={entry_x};entryY={entry_y};entryPerimeter=0;'
    cell = ET.SubElement(mxroot, 'mxCell', id=e['id'], source=source_id, target=target_id, value='', style=style, edge='1', parent='1')
    geo = ET.SubElement(cell, 'mxGeometry', relative='1', **{'as': 'geometry'})
    ET.SubElement(geo, 'mxPoint', x=str(points[0][0]), y=str(points[0][1]), **{'as': 'sourcePoint'})
    ET.SubElement(geo, 'mxPoint', x=str(points[-1][0]), y=str(points[-1][1]), **{'as': 'targetPoint'})
    if len(points) > 2:
        waypoints = ET.SubElement(geo, 'Array', **{'as': 'points'})
        for x, y in points[1:-1]:
            ET.SubElement(waypoints, 'mxPoint', x=str(x), y=str(y))

svg.append('</g></svg>')
(OUT / 'ai-code-design-flow.svg').write_text('\n'.join(svg) + '\n')
ET.indent(mxfile)
ET.ElementTree(mxfile).write(OUT / 'ai-code-design-flow.drawio', encoding='utf-8', xml_declaration=True)
print(f'已生成 {len(nodes)} 个图形、{len(edges)} 条连线：{OUT}')
