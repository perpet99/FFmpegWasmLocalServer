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
