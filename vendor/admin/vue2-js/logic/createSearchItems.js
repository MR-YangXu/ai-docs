import Vue from 'vue';
import { clone } from '../utils/adminCore';

/** 兼容拦截器包一层 data，以及直接返回 page_items 的两种接口。 */
export function readSearchPayload(res) {
  const body = res && res.data && (res.data.page_items || res.data.user_page_items) ? res.data : res || {};
  const items = body.page_items || [];
  return { items, visible: body.user_page_items || items };
}

/** 把 searchItem 的逗号 key 拆成起止字段，同时保留原 key。 */
export function applySearchPatch(query, patch) {
  const next = { ...query };
  Object.keys(patch || {}).forEach((key) => {
    const value = patch[key];
    if (key.indexOf(',') > -1 && Array.isArray(value)) {
      const parts = key.split(',');
      next[parts[0]] = value[0] || '';
      next[parts[1]] = value[1] || '';
    }
    next[key] = value;
  });
  return next;
}

function applyHidden(items, hiddenKeys) {
  const hidden = hiddenKeys || [];
  return items.filter((item) => !hidden.includes(item.key) && !hidden.includes(item.id) && !hidden.includes(item.name));
}

/**
 * 按实例管理后端筛选项。在 data() 中创建，beforeDestroy 中 dispose()。
 * fetchItems(pageItemId) 对应 getSearchData；saveItems(ids, pageItemId) 对应 setSearchData。
 */
export function createSearchItems(pageItemId, options) {
  const settings = options || {};
  const state = Vue.observable({
    items: [],
    userItems: [],
    visibleItems: [],
    values: clone(settings.initialValues || {}),
    hiddenKeys: settings.hiddenKeys ? settings.hiddenKeys.slice() : [],
    loading: false,
    error: null,
  });
  let sequence = 0;
  let active = true;

  const load = async () => {
    if (!active) return undefined;
    if (typeof settings.fetchItems !== 'function') throw new Error('createSearchItems 需要 fetchItems(pageItemId)');
    const ticket = ++sequence;
    state.loading = true;
    state.error = null;
    try {
      const payload = readSearchPayload(await settings.fetchItems(pageItemId));
      if (!active || ticket !== sequence) return undefined;
      state.items = payload.items;
      state.userItems = payload.visible;
      state.visibleItems = applyHidden(payload.visible, state.hiddenKeys);
      return payload;
    } catch (error) {
      if (active && ticket === sequence) state.error = error;
      return undefined;
    } finally {
      if (active && ticket === sequence) state.loading = false;
    }
  };

  const persist = async (items) => {
    if (typeof settings.saveItems !== 'function') return;
    await settings.saveItems(
      items.map((item) => item.page_search_items_id),
      pageItemId,
    );
  };

  return {
    state,
    load,
    patchValues(patch) {
      state.values = applySearchPatch(state.values, patch);
    },
    resetValues(next) {
      state.values = clone(next || settings.initialValues || {});
    },
    setHidden(keys) {
      state.hiddenKeys = (keys || []).slice();
      state.visibleItems = applyHidden(state.userItems.length ? state.userItems : state.items, state.hiddenKeys);
    },
    async remove(item) {
      const source = state.userItems.length ? state.userItems : state.visibleItems;
      const next = source.filter((current) => current.page_search_items_id !== item.page_search_items_id);
      await persist(next);
      return load();
    },
    async add(item) {
      const source = state.userItems.length ? state.userItems : state.visibleItems;
      await persist(source.concat(item));
      return load();
    },
    dispose() {
      active = false;
      sequence += 1;
    },
  };
}
