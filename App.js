import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Camera} from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as FaceDetector from 'expo-face-detector';
import * as ImageManipulator from 'expo-image-manipulator';
export default function App() {
  const [camera, setCamera] = useState({
    hasCameraPermission: null,
    type: Camera.Constants.Type.front,
  });
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [firstPhote, setFirstPhoto] = useState(null);
  const [secondPhoto, setSecondPhoto] = useState(null);
  const [secondFace, setSecondFace] = useState(null);
  const [firstFace, setFitstFace] = useState([]);
  const [swicher, setSwicher] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [deploy, setdeploy] = useState([]);
  const [viewSize, setViewSize] = useState([]);
  const [imgSize, setImgSize] = useState([]);
  const cameraRef = useRef(null);
  const [cropImageI, setCropImageI] = useState(null);
  const [cropImageII, setCropImageII] = useState(null);
  useEffect(() => {
    (async () => {
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      setCamera(prevState => ({
        ...prevState,
        hasCameraPermission: status === 'granted',
      }));
    })();
  }, []);
  async function takePicture() {
    if (cameraRef.current) {
      const options = {quality: 0.5, base64: true};
      const data = await cameraRef.current.takePictureAsync(options);
      setImgSize({height: data.height, width: data.width});
      swicher ? setFirstPhoto(data.uri) : setSecondPhoto(data.uri);
      if (swicher == false) {
        setIsCameraVisible(false);
      }
      setSwicher(!swicher);
    } else {
      console.log('camera not ready');
    }
  }
  async function dividImage() {
    if (cropImageI == null && cropImageII == null) {

      const fx = firstFace[0].bounds.origin.x;
      const fy = firstFace[0].bounds.origin.y;
      const fw = firstFace[0].bounds.size.width;
      const fh = firstFace[0].bounds.size.height;
      const sx = secondFace[0].bounds.origin.x;
      const sy = secondFace[0].bounds.origin.y;
      const sw = secondFace[0].bounds.size.width;
      const sh = secondFace[0].bounds.size.height;
      const xFactor = imgSize.width / viewSize.width;
      const yFactor = imgSize.height / viewSize.height;

      const cropI = await ImageManipulator.manipulateAsync(firstPhote, [
        {
          crop: {
            originX: fx * xFactor ,
            originY: fy * yFactor,
            width: fw * xFactor,
            height: fh * yFactor,
          },
        },
      ]);
      const cropII = await ImageManipulator.manipulateAsync(secondPhoto, [
        {
          crop: {
            originX: sx * xFactor,
            originY: sy * yFactor,
            width: sw * xFactor,
            height: sh * yFactor,
          },
        },
      ]);
      setCropImageI(cropI.uri);
      setCropImageII(cropII.uri);
    } else {
      console.log('undo swap');
      setCropImageI(null);
      setCropImageII(null);
    }
  }
  async function flip() {
    const flipImg = await ImageManipulator.manipulateAsync(firstPhote, [{ flip: ImageManipulator.FlipType.Horizontal }]);
    setFirstPhoto(flipImg.uri);
    const flipImgTwo = await ImageManipulator.manipulateAsync(secondPhoto, [{ flip: ImageManipulator.FlipType.Horizontal }]);
    setSecondPhoto(flipImgTwo.uri);
  }
  function getViewSize(event) {
    setViewSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  }

  async function saveImg() {
    try {
      if (firstPhote != null && secondPhoto != null) {
        await CameraRoll.save(firstPhote, 'photo');
        await CameraRoll.save(secondPhoto, 'photo');
        setIsCameraVisible(true);
        console.log('Save image success');
      } else {
        console.log('photo is null');
      }
    } catch (error) {
      console.log('Save image error');
      console.log(error);
    }
  }
  function backToCamera() {
    setIsCameraVisible(true);
    setFirstPhoto(null);
    setSecondPhoto(null);
    setFitstFace([]);
    setSecondFace([]);
    setdeploy([]);
  }
  function setFace(face) {
    if (face.length != 0) {
      setdeploy(face);
      setFaceDetected(true);
      ToastAndroid.show('Face detected', ToastAndroid.SHORT);
    } else {
      setFaceDetected(false);
      ToastAndroid.show('Face not detected', ToastAndroid.SHORT);
    }
    swicher ? setFitstFace(face) : setSecondFace(face);
    if (firstPhote != null) {
    }
  }
  if (camera.hasCameraPermission === null) {
    return <View />;
  } else if (camera.hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={styles.container} onLayout={getViewSize}>
        {isCameraVisible ? (
          <View>
            <Camera
              style={styles.camera}
              ref={cameraRef}
              type={camera.type}
              faceDetectorSettings={{
                mode: FaceDetector.FaceDetectorMode.accurate,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications:
                  FaceDetector.FaceDetectorClassifications.none,
                minDetectionInterval: 100 / 5,
                tracking: false,
              }}
              onFacesDetected={({faces}) => {
                setFace(faces);
              }}
            />
            {deploy.map(({bounds}, i) => {
              return (
                <View
                  key={i}
                  style={[
                    styles.faceBox,
                    {
                      width: bounds.size.width,
                      height: bounds.size.height,
                      left: bounds.origin.x,
                      top: bounds.origin.y,
                    },
                  ]}
                />
              );
            })}
            <TouchableOpacity
              style={styles.undoButton}
              disabled={!faceDetected}
              onPress={() => takePicture()}>
              <Text style={styles.homeButtonText}>
                {' '}
                {swicher ? 'Take first photo' : 'Take seconde photo'}{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setCamera({
                  ...camera,
                  type:
                    camera.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                });
              }}>
              <Text style={styles.text}> Flip </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>

            <Image source={{uri: firstPhote}} style={styles.image} />
            <Image source={{uri: cropImageII}} style={[styles.overLayImage, 
            {
              width: firstFace[0].bounds.size.width,
              height: firstFace[0].bounds.size.height/2,
              left: firstFace[0].bounds.origin.x,
              top: firstFace[0].bounds.origin.y- viewSize.height/7,
            }]} />
            <Image source={{uri: secondPhoto}} style={styles.image} />
            <Image source={{uri: cropImageI}} style={[styles.overLayImage, 
            {                  
              width: secondFace[0].bounds.size.width,
              height: secondFace[0].bounds.size.height/2,
              left: secondFace[0].bounds.origin.x,
              top: secondFace[0].bounds.origin.y +  viewSize.height/3,
            }]} />


            <View
              style={[
                styles.faceBox,
                {
                  width: firstFace[0].bounds.size.width,
                  height: firstFace[0].bounds.size.height/2,
                  left: firstFace[0].bounds.origin.x,
                  top: firstFace[0].bounds.origin.y- viewSize.height/7,
                },
              ]}
            />
            <View
              style={[
                styles.faceBox,
                {
                  width: secondFace[0].bounds.size.width,
                  height: secondFace[0].bounds.size.height/2,
                  left: secondFace[0].bounds.origin.x,
                  top: secondFace[0].bounds.origin.y +  viewSize.height/3,
                },
              ]}
            />



            <TouchableOpacity style={styles.saveButton} onPress={saveImg}>
              <Text style={styles.homeButtonText}> Save </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.undoButton} onPress={dividImage}>
              <Text style={styles.homeButtonText}>
                {' '}
                {cropImageI != null ? 'undo' : 'swap'}{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={backToCamera}>
              <Text style={styles.homeButtonText}> Camera </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  view: {
    flex: 1,
    backgroundColor: 'Black',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOpacity: {
    flex: 1,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    margin: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '50%',
  },
  homeButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    margin: 20,
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    position: 'absolute',
    bottom: 100,
    right: 50,
    zIndex: 3,
  },
  undoButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    position: 'absolute',
    bottom: 100,
    left: 50,
    zIndex: 3,
  },
  cameraButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 150,
    zIndex: 3,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#89ff00',
    borderStyle: 'solid',
    zIndex: 9,
  },
  overLayImage: {
    position: 'absolute',
    zIndex: 2,
  },
  canvas: {
    width: '100%',
    height: '50%',
  },
});
