


const readFromBlobOrFile = (blob) => (
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = ({ target: { error: { code } } }) => {
      reject(Error(`File could not be read! Code=${code}`));
    };
    fileReader.readAsArrayBuffer(blob);
  })
);

const parseArgs = (Core, args) => {
  const argsPtr = Core._malloc(args.length * Uint32Array.BYTES_PER_ELEMENT);
  args.forEach((s, idx) => {
    const buf = Core._malloc(s.length + 1);
    Core.writeAsciiToMemory(s, buf);
    Core.setValue(argsPtr + (Uint32Array.BYTES_PER_ELEMENT * idx), buf, 'i32');
  });
  return [args.length, argsPtr];
};

const ffmpeg = (Core, args) => {
  Core.ccall(
    'proxy_main',
    'number',
    ['number', 'number'],
    parseArgs(Core, ['ffmpeg', '-nostdin', ...args]),
  );
};

const runFFmpeg = async (ifilename, data, args, ofilename, extraFiles = [],message) => {
  let resolve = null;
  let file = null;
  const Core = await createFFmpegCore({
    printErr: (m) => {
      console.log(m);
      message.innerHTML = m;
    },
    print: (m) => {
      console.log(m);
      if (m.startsWith('FFMPEG_END')) {
        resolve();
      }
    },
  });
  extraFiles.forEach(({ name, data: d }) => {
    Core.FS.writeFile(name, d);
  });
  Core.FS.writeFile(ifilename, data);
  ffmpeg(Core, args);
  await new Promise((_resolve) => { resolve = _resolve });
  if (typeof ofilename !== 'undefined') {
    file = Core.FS.readFile(ofilename);
    Core.FS.unlink(ofilename);
  }
  return { Core, file };
};


const runFFmpeg2 = async (filelist = [] , args, ofilename,extraFiles = [],message) => {
  let resolve = null;
  let file = null;
  let timeMessage = ""
  let timeMessage2 = ""
  let speedMessage = ""

  const Core = await createFFmpegCore({
    printErr: (m) => {
       console.log(m);
      let mm = String(m)
      
      let index = m.indexOf('Duration')
      if( -1 < index){
         timeMessage = m.substr(index+10,11);
       }

       index = m.indexOf('time')
       if( -1 < index){
        timeMessage2 = m.substr(index+5,11);
        }
 
      index = m.indexOf('speed')
       if( -1 < index){
        speedMessage = m.substr(index,11);
        }
 

      message.innerHTML =  timeMessage2 + " / " + timeMessage + "  (" + speedMessage + ")"; 
    },
    // process : ({ ratio }) => {
    //   console.log(ratio);

    // }
    // ,

    print: (m) => {
      console.log(m);
      if (m.startsWith('FFMPEG_END')) {
        resolve();
      }
    },
  });
  

  
  // Core.setProgress(({ ratio }) => {
    
  //   console.log(ratio);

  // });

  filelist.forEach(({ name, data: d }) => {
    Core.FS.writeFile(name, d);
  });

  extraFiles.forEach(({ name, data: d }) => {
    Core.FS.writeFile(name, d);
  });


  ffmpeg(Core, args);

  await new Promise((_resolve) => { resolve = _resolve });

  if (typeof ofilename !== 'undefined') {
    console.log("success")
    console.log(ofilename)

    file = Core.FS.readFile(ofilename);
    Core.FS.unlink(ofilename);
  }
  return { Core, file };
};

const b64ToUint8Array = (str) => (Uint8Array.from(atob(str), c => c.charCodeAt(0)));



function convertTest(){
  console.log("sdffffffffffffffff")
}


function removeFileName(str)
{
  return str.replaceAll('-front.mp4','')
    .replaceAll('-back.mp4','')
    .replaceAll('-left_repeater.mp4','')
    .replaceAll('-right_repeater.mp4','') ;

}



function getText(str) {

    
    const text = removeFileName(str);
    console.log(text)
    const text2 = text.split('_');
    const text3 = text2[1].split('-');
    //return text2[0] + '   TIME\\=' + text3[0] + '\\:'+text3[1] +'\\:'+ text3[2]; 
    //return "\\'" + text2[0] + "   TIME=\\':timecode=" + text3[0] + '\\:'+text3[1] +'\\:'+ text3[2]; 
    console.log(text2)
    if( text2.length != 2)
      throw 'error1'

    console.log(text3)
    if( text3.length != 3)
      throw 'error2'

    var r = `\\'${text2[0]}  TIME=\\':timecode=\\'${text3[0]}:${text3[1]}:${text3[2]}:00\\'`
    console.log(r)
    return r;

    //return "\\'{0}  TIME=\\':timecode=\\'{1}:{2}:{3}:00\\'".format(text2[0], text3[0], text3[1],text3[2]);
  }



async function convertTimestamp(file,video,link,message){
    
    await convertTimestamp2(file,removeFileName(file.name),video,link,link)


}

function download2(dataurl, filename,link) {
  
  link.href = dataurl;
  link.download = filename;
  //link.click();
}

function removeFileName(str)
{
  return str.replaceAll('-front.mp4','')
    .replaceAll('-back.mp4','')
    .replaceAll('-left_repeater.mp4','')
    .replaceAll('-right_repeater.mp4','') ;

}

async function convertTimestamp2(filelaw,fileName,video,link,message){
    fileData = new Uint8Array(await readFromBlobOrFile(filelaw));
    const param = 'scale=1280:960,drawtext=fontfile=arial.ttf:fontsize=24:text=' +getText(fileName) + ':rate=30:fontcolor=white:box=1:boxcolor=0x00000000@1:x=(w-text_w)/10:y=text_h+10';
    
    const IN_FILE_NAME = 'video.mp4';
    const OUT_FILE_NAME = 'video2.mp4';

    const args = ['-i', IN_FILE_NAME, '-vf', param,  OUT_FILE_NAME];

    const { file } = await runFFmpeg2([{ name: IN_FILE_NAME, data: fileData }], args, OUT_FILE_NAME, [{ name: 'arial.ttf', data: b64ToUint8Array(ARIAL_TTF) }],message)

    video.src = URL.createObjectURL(new Blob([file.buffer], { type: 'video/mp4' }));

    message.innerHTML = 'download link'

    download2(video.src,fileName+'.mp4',link);
}

