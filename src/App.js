import { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBFyKNZpK4UquZk-dJz4KvKuD7k_VfoBh4",
  authDomain: "group-chat-8a0dc.firebaseapp.com",
  projectId: "group-chat-8a0dc",
  storageBucket: "group-chat-8a0dc.appspot.com",
  messagingSenderId: "558821088908",
  appId: "1:558821088908:web:ee35edc829d91db0dae5a9",
  measurementId: "G-039EJX55KD",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>
          <img
            src="chat.png"
            alt="chat icon"
            width="32px"
            style={{ marginRight: "10px" }}
          />
          Group chat
        </h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        <img
          src="https://img.icons8.com/color/48/000000/google-logo.png"
          className="googleIcon"
          alt="google icon"
        />
        Sign in with Google
      </button>
      <p className="warningMsg">
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  const [profile, setProfile] = useState({});
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      setProfile(user);
    } else {
      return null;
    }
  });

  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        <img src={profile.photoURL} alt="profile" className="profileLogimg" />
        Sign Out
        {/* <p>{profile.displayName}</p> */}
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => {
            return <ChatMessage key={msg.id} message={msg} />;
          })}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          <img src="send-mail.png" alt="" width="32px" />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          className="profileimg"
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt="user"
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
