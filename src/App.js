import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ShoppingAppABI from './contracts/ShoppingAppABI.json';
import './App.css';

const contractAddress = '0xFBE161a3AF6B705720A3EceeA8659d24b4607C28';

function ShoppingApp() {
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(
            ShoppingAppABI,
            contractAddress
          );
          setContract(contractInstance);

          const itemCount = await contractInstance.methods.itemCount().call();
          const items = [];
          for (let i = 0; i < itemCount; i++) {
            const item = await contractInstance.methods.items(i).call();
            items.push(item);
          }
          setItems(items);

          const boughtItems = await contractInstance.methods.getBoughtItems(accounts[0]).call();
          setBoughtItems(boughtItems);

          const soldItems = await contractInstance.methods.getSoldItems(accounts[0]).call();
          setSoldItems(soldItems);
        } catch (error) {
          console.error("Failed to connect to Ethereum provider:", error);
        }
      } else {
        console.error("Please install MetaMask!");
      }
    };

    initWeb3();
  }, []);

  const addItem = async (name, imageURL, description, location, price) => {
    if (contract) {
      await contract.methods.addItem(name, imageURL, description, location, +price).send({ from: account });
      const itemCount = await contract.methods.itemCount().call();
      const newItem = await contract.methods.items(itemCount - 1).call();
      setItems([...items, newItem]);
    }
  };

  const buyItem = async (itemId, token) => {
    if (contract) {
      try {
        await contract.methods.buyItem(itemId, token).send({ from: account });
        const boughtItems = await contract.methods.getBoughtItems(account).call();
        const soldItems = await contract.methods.getSoldItems(account).call();
        setBoughtItems(boughtItems);
        setSoldItems(soldItems);
      } catch (error) {
        console.error("Error buying item:", error.message);
        if (error.code === -32000) {
          // Handle transaction revert error
          const revertReason = error.message.replace('VM Exception while processing transaction: revert ', '');
          console.error("Transaction reverted:", revertReason);
        }
      }
    }
  };

  return (
    <div className="shopping-app">
      <h1>Shopping App</h1>
      <h2>Available Items</h2>
      <div className="items-container">
        {items.map((item, index) => (
          <div className="item-box" key={index}>
            <h3>{item.name}</h3>
            <img src={item.imageURL} alt={item.name} />
            <p>{item.description}</p>
            <p>Price: {item.price}</p>
            <p>Location: {item.location}</p>
            <p>Sold: {item.sold ? 'Yes' : 'No'}</p>
            <button onClick={() => buyItem(index, contract.options.address)}>Buy with Contract Token</button>
          </div>
        ))}
      </div>

      <h2>Bought Items</h2>
      <div className="items-container">
        {boughtItems.map((itemId, index) => (
          <div className="item-box" key={index}>
            <p>Item ID: {itemId}</p>
          </div>
        ))}
      </div>

      <h2>Sold Items</h2>
      <div className="items-container">
        {soldItems.map((itemId, index) => (
          <div className="item-box" key={index}>
            <p>Item ID: {itemId}</p>
          </div>
        ))}
      </div>

      <h2>Add Item</h2>
      <form
        className="add-item-form"
        onSubmit={(e) => {
          e.preventDefault();
          const name = e.target.elements.name.value;
          const imageURL = e.target.elements.imageURL.value;
          const description = e.target.elements.description.value;
          const location = e.target.elements.location.value;
          const price = e.target.elements.price.value;
          addItem(name, imageURL, description, location, price);
        }}
      >
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="imageURL" placeholder="Image URL" />
        <input type="text" name="description" placeholder="Description" />
        <input type="text" name="location" placeholder="Location" />
        <input type="number" name="price" placeholder="Price" />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

export default ShoppingApp;