import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class Toast {
  static Success(msg) {
    toast.success(msg);
  }

  static Error(msg) {
    toast.error(msg);
  }
}

export default Toast;
