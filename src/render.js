

// Selecting Elements
const videoElement = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const videoSelectbtn = document.getElementById('videoSelectBtn')


videoSelectbtn.onclick= getVideoSources;
stopBtn.onclick=handleStop;


const { desktopCapturer, remote } = require('electron')
const  { Menu }  = remote;  

async function getVideoSources () {

  const inputSources = await desktopCapturer.getSources({
      types:['window','screen']
  })

  const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source =>{

         return {
             label:source.name,
             click:() =>selectSource(source)
         }
      })
  )


  videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {

    videoSelectbtn.innerText = source.name

    const constraints = {
        audio:false,
        video: {
            mandatory: {
                chromeMediaSource:'desktop',
                chromeMediaSourceId:source.id
            }
        }
    }

    const stream =  await navigator.mediaDevices
    .getUserMedia(constraints)

    videoElement.srcObject = stream;
    videoElement.play();

    const options ={ mimeType :'video/webm; codecs=vp9'}

    mediaRecorder = new MediaRecorder(stream,options)
    
    // Register Event Handlers
    MediaRecorder.ondataavailable = handleDataAvailable;
    MediaRecorder.onstop =handleStop;

}


function handleDataAvailable(e) {
    console.log('Video data available')
    recordedChunks.push(e.data)

}

const {writeFile} = require('fs')

async function handleStop(e) {

    const blob = new Blob(recordedChunks, {
        type:'video/webm; codecs=vp9'
    })

    const buffer = Buffer.from(await blob.arrayBuffer())

    const {filePath }  = await remote.dialog.showSaveDialog({

        buttonLabel:'Save Video',
        defaultPath:`vid-${Date.now()}.webm`
    })
    writeFile(filePath,buffer,()=>{console.log('video saved successfully')});
}