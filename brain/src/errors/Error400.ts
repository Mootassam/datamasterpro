export default class Error400 extends Error {
    code: number;
  
    constructor(msg: string) {
      super(msg);
      this.code = 400;
    }
  }
  