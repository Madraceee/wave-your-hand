import React,{useEffect,useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json'



export default function App() {

  const [ currentAccount,setCurrentAccount] = useState("");
  const contractAddress= "0x2F03B5D9EAdC06Fd8C70706580f74cA36bd87fc2";
  const contractABI= abi.abi;
  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () =>{
      try{
        const {ethereum } =window;
        if(ethereum){
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          const waves = await wavePortalContract.getAllWaves();

          let wavesSimple = [];
          waves.forEach( wave =>{
            wavesSimple.push({
              address: wave.waver,
              timestamp : new Date(wave.timestamp*1000),
              message: wave.message
            });
          });

          console.log('waves are',wavesSimple);

          setAllWaves(wavesSimple);
        }else
          console.log('Ethereum object unavailable');
      }catch(err){
        console.log(err);
      }
  }
  
  const wave = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum)
        console.log('Connect to metamask');
      else
        console.log('We have a ethereum object',ethereum);

      const accounts = await ethereum.request({method:'eth_accounts'});

      if(accounts.length!=0){
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      }
      else{
        console.log("No authorized account found")
      }
    } catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({method:"eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const waves = async () =>{
    try{
      const {ethereum}=window;

      if(ethereum)
      {
        const provider= new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const messageContent = document.querySelector('textarea');

        let count = await wavePortalContract.getTotalWaves();
        console.log('Total wave count=',count);

        
        // Writing data into the blockchain
        console.log(messageContent.value);
        const waveTxn = await wavePortalContract.wave(messageContent.value,{ gasLimit: 300000 });
        console.log('Mining..',waveTxn.hash);
        await waveTxn.wait();

        console.log('Mined :)');

        count = await wavePortalContract.getTotalWaves();
        console.log('Total wave count after waving =',count.toNumber());
        
      } else {
        console.log('Ethereum objecct does not exists');        
      }
    } catch(err)
    {
      console.log(err);
    }
  }

  useEffect( ()=>{
    wave();
  })
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        <p>My name is Madraceee and I love web3. I am currently learning Web3 so do feel free to provide feedback.</p>
        <p>Wave at me after connecting your wallet.</p>
        </div>

        <button className="waveButton" onClick={waves}>
          Wave at Me
        </button>
        {}
        {currentAccount && (
        <textarea class="message" placeholder="Enter your message to me..."></textarea>
        )          
        }
        {currentAccount && (
            <button className="showMessages" onClick={getAllWaves}>Show previous messages</button>
          )
        }
        
        {!currentAccount &&(
        <button className="waveButton" onClick={connectWallet}>
          Connect button
        </button>
        )}
        
        {allWaves.map((wave, index) => {
          return (
            <div className="transactionRecord" key={index} style={{ marginTop: "16px", padding: "8px" }}>
              <div>Message:<div className="messageRecord">{wave.message}</div></div>
              <div>From: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
