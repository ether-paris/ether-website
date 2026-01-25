export const toast = $state({
  visible: false,
  message: "",

  error(msg: string) {
    this.message = msg;
    this.visible = true;
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  },
});
