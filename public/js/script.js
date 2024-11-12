// document.getElementById('selectFolderBtn').addEventListener('click', async () => {
//     if ('showDirectoryPicker' in window) {
//         try {
//             // Open the directory picker
//             const directoryHandle = await window.showDirectoryPicker();
            
//             // Clear the file list
//             const fileList = document.getElementById('fileList');
//             fileList.innerHTML = '';

//             // Read files from the selected directory
//             for await (const entry of directoryHandle.values()) {
//                 if (entry.kind === 'file') {
//                     const file = await entry.getFile();
//                     const listItem = document.createElement('li');
//                     listItem.textContent = file.name;
//                     fileList.appendChild(listItem);
//                 }else{
//                     console.log(entry.kind)

//                 }
//             }
//         } catch (err) {
//             console.error("Error reading files from folder:", err);
//         }
//     } else {
//         alert("The File System Access API is not supported in this browser.");
//     }
// });


var btn = document.getElementById('selectFolderBtn')
if( btn != null){
    btn.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            try {
                // Open the directory picker
                const directoryHandle = await window.showDirectoryPicker();
    
                // Clear the file list
                const fileList = document.getElementById('fileList');
                fileList.innerHTML = '';
    
                // Read files recursively
                await readFilesRecursively(directoryHandle, fileList);
            } catch (err) {
                console.error("Error reading files from folder:", err);
            }
        } else {
            alert("The File System Access API is not supported in this browser.");
        }
    });
    
}

async function readFilesRecursively(directoryHandle, fileList, path = '') {

    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {

            

            const file = await entry.getFile();
            

            const listItem = document.createElement('li');
            listItem.textContent = `${path}/${file.name}`;
            fileList.appendChild(listItem);
        } else if (entry.kind === 'directory') {
            await readFilesRecursively(entry, fileList, `${path}/${entry.name}`);
        }
    }
}
