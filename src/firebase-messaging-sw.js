importScripts('https://www.gstatic.com/firebasejs/8.7.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.7.1/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
	apiKey: 'AIzaSyCRZOikaWuIgXWlTKUPuSljAQTdWHF61jU',
	authDomain: 'project-tasks-294214.firebaseapp.com',
	projectId: 'project-tasks-294214',
	storageBucket: 'project-tasks-294214.appspot.com',
	messagingSenderId: '570716917094',
	appId: '1:570716917094:web:e356552cf293fcff454ca7',
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
	console.log('Received background message', payload)
})
