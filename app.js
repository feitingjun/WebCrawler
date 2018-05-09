import get from "./get";

let url = "http://ibaotu.com/sucai/550309.html#";
let a = async () => {
    await get(url,["img","video"]);
    console.log("完成")
}
a();