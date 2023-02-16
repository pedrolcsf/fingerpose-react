import {useRef, useState} from 'react'
import * as tf from '@tensorflow/tfjs'
import * as handpose from '@tensorflow-models/handpose'
import Webcam from 'react-webcam'
import { drawHand } from './utilities'

import * as fp from 'fingerpose'
import victory from './victory.png'
import thumbs_up from './thumbs_up.png'

function App() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [emoji, setEmoji] = useState(null)
  const images = {
    thumbs_up: thumbs_up,
    victory: victory
  }

  const runHandpose = async () => {
    const net = await  handpose.load()
    console.log('handpose model loaded')

    setInterval(() => {
      detect(net)
    }, 10)
  }

  const detect = async (net) => {
    if(
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ){
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if(hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ])

        const gesture = await GE.estimate(hand[0].landmarks, 8)
        if(gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((i) => i.confidence)
          const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence))
          setEmoji(gesture.gestures[maxConfidence + 1].name)
        }
      }

      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  runHandpose()
  return (
    <div>
      <header>
      <Webcam
        ref={webcamRef}
        style={{
          opacity:0,
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 9,
          width: 800,
          height: 600
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 9,
          width: 800,
          height: 600
        }}
       />
       {emoji !== null ? <img src={images[emoji]} style={{
        position: 'absolute',
        marginLeft: "auto",
        marginRight: "auto",
        left: 400,
        bottom: 400,
        right: 0,
        textAlign: "center",
        height: 100,
        zIndex: 20
       }} /> : ""}
       </header>
    </div>
  )
}

export default App
