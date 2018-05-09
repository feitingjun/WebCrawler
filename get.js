import request from "request";
import cheerio from "cheerio";
import fs from "fs";
import path from "path";
let j = request.jar()
if(!fs.existsSync(__dirname + "/images")){
    fs.mkdirSync(__dirname + "/images");
}
if(!fs.existsSync(__dirname + "/video")){
    fs.mkdirSync(__dirname + "/video");
}
const get = (url,type) => {
    let images = [];
    let videos = [];
    let ipIndex = url.indexOf("//");
    let ipIndexEnd = url.indexOf("/",ipIndex+2);
    let ip = url.substring(0,ipIndexEnd);
    return new Promise((resolve,reject) => {
        request({url:url,jar:j},async (err,response,body) => {
            let cookie_string = j.getCookieString(url); // "key1=value1; key2=value2; ..."
            let cookies = j.getCookies(url);
            j.setCookie(cookie_string);
            let imgRequest;
            let videoRequest;
            let $ = cheerio.load(body.toString());
            if(type.indexOf("img")>-1){
                imgRequest = $("img").map(async (i,v) => {
                    let src = $(v).attr("src");
                    if(src){
                        try{
                            let patt1 = /^\//;
                            let patt2 = /^\/\//;
                            if(patt1.test(src) && !patt2.test(src)) src = ip + src;
                            if(patt2.test(src)) src = "http:" + src;
                            let index = src.lastIndexOf("/");
                            let name = src.substr(index+1);
                            if(name.lastIndexOf("?")>-1) name = name.substr(0,name.lastIndexOf("?"));
                            let nIndex = name.search(/.jpg|.png|.gif/i);
                            if(nIndex>-1){
                                name = name.substring(0,nIndex+4);
                            }else{
                                name = name + ".jpg";
                            }
                            name = name.replace(/[`~!@#$%^&*()_\-+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g,"");
                            if(images.indexOf(name) == -1){
                                await request(src).pipe(fs.createWriteStream(__dirname + `/images/${name}`));
                                images.push(name);
                                console.log(`保存图片  ${name}`);
                            }
                        }catch(err){
                            console.log(err);
                        }
                    }
                })
            }
            if(type.indexOf("video")>-1){
                videoRequest = $("video").map(async (i,v) => {
                    let src = $(v).attr("src");
                    let sIndex = src.search(/.mp4/i);
                    if(sIndex>-1) src = src.substring(0,sIndex+4);
                    if(src){
                        try{
                            let patt1 = /^\//;
                            let patt2 = /^\/\//;
                            if(patt1.test(src) && !patt2.test(src)) src = ip + src;
                            if(patt2.test(src)) src = "http:" + src;
                            console.log(src)
                            let index = src.lastIndexOf("/");
                            let name = src.substr(index+1);
                            if(name.lastIndexOf("?")>-1) name = name.substr(0,name.lastIndexOf("?"));
                            let nIndex = name.search(/.mp4/i);
                            if(nIndex>-1){
                                name = name.substring(0,nIndex+4);
                            }else{
                                name = name + ".mp4";
                            }
                            // name = name.replace(/[`~!@#$%^&*()_\-+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g,"");
                            if(videos.indexOf(name) == -1){
                                request(src).pipe(fs.createWriteStream(__dirname + `/video/${name}`));
                                videos.push(name);
                                console.log(`保存视频  ${name}`);
                            }
                        }catch(err){
                            console.log(err);
                        }
                    }
                })
            }
            if(await imgRequest && await videoRequest){
                resolve();
            }
        })
    })
}

export default get;