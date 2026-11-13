/** 同一条搜索栏里只保留一个弹出层。 */

export function createPopupHub() {
  let token = 0;
  const listeners = [];
  return {
    nextId() {
      token += 1;
      return token;
    },
    open(id) {
      listeners.forEach((fn) => fn(id));
    },
    listen(fn) {
      listeners.push(fn);
      return () => {
        const index = listeners.indexOf(fn);
        if (index >= 0) listeners.splice(index, 1);
      };
    },
  };
}

export const searchPopupMixin = {
  inject: {
    searchPopupHub: { default: null },
  },
  data() {
    return { searchPopupKey: 0 };
  },
  created() {
    const hub = this.searchPopupHub;
    if (!hub) return;
    this.searchPopupKey = hub.nextId();
    this._offSearchPopup = hub.listen((id) => {
      if (id !== this.searchPopupKey) this.closeSearchPopup();
    });
  },
  beforeDestroy() {
    if (this._offSearchPopup) this._offSearchPopup();
  },
  methods: {
    claimSearchPopup() {
      if (this.searchPopupHub) this.searchPopupHub.open(this.searchPopupKey);
    },
    onPopupVisible(open) {
      if (open) this.claimSearchPopup();
    },
    closeElementPopup(refName) {
      const control = this.$refs[refName];
      if (!control) return;
      if (typeof control.toggleDropDownVisible === "function") {
        control.toggleDropDownVisible(false);
        return;
      }
      if (typeof control.handleClose === "function") {
        control.handleClose();
        return;
      }
      if (typeof control.hidePicker === "function") {
        control.hidePicker();
        return;
      }
      if (typeof control.blur === "function") control.blur();
    },
    closeSearchPopup() {},
  },
};
