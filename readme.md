# CameraApp 

## Start

```bash 
##init project 
npx react-native init CameraApp  

##install package 
cd CameraApp 
##intall yarm
npm install -g yarm 
##install firebase dependency
yarn add @react-native-firebase/app
yarn add @react-native-firebase/database

##install image-picker 
yarn add react-native-image-picker

##install expo camera
yarn add expo
npx expo install expo-camera
npx install-expo-modules@latest
npm i expo-permissions
```
# Follow this instruction
https://github.com/expo/expo/tree/sdk-48/packages/expo-camera
# Add expo dependency to CameraApp 
In app.json file
```
{
  "name": "CameraApp",
  "displayName": "CameraApp", 
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ]
    ]
  }
}
```
In android/gradle.properties
```
newArchEnabled=true
```
# Run

```
npx react-native run-android 
```
# 

# Work flow 

1. Changed camre type to front
2. Take two picture 
3. Try face swap 
4. store image 

# Hours 
5 hr

# Challenges

Configuration, dependency error

#Video Demo

https://user-images.githubusercontent.com/86145579/233823635-b83c8a70-63bc-46fc-a36a-4328ccfa734c.mp4


