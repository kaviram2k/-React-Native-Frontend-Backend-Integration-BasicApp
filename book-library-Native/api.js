import axios from "axios";

export default axios.create({
  baseURL: "http://192.168.8.102:4000/api"
});
