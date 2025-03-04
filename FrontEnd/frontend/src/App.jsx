import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// import { Button, Card } from "@/components/ui";
import contractABI from "./TaskManagerABI.json";

const contractAddress = "0x047b37Ef4d76C2366F795Fb557e3c15E0607b7d8"; // Replace after deployment

export default function TaskManagerApp() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setAccount(await signer.getAddress());
      setProvider(provider);
      setContract(contract);
      fetchTasks(contract);
    } else {
      alert("MetaMask is required!");
    }
  }

  async function fetchTasks(contract) {
    const tasks = [];
    for (let i = 0; i < 10; i++) {
      try {
        const task = await contract.getTask(i);
        if (task.title) tasks.push(task);
      } catch (error) {
        break;
      }
    }
    setTasks(tasks);
  }

  async function addTask() {
    if (!title || !description) return;
    const tx = await contract.addTask(title, description);
    await tx.wait();
    fetchTasks(contract);
  }

  async function completeTask(taskId) {
    const tx = await contract.markTaskCompleted(taskId);
    await tx.wait();
    fetchTasks(contract);
  }

  async function deleteTask(taskId) {
    const tx = await contract.deleteTask(taskId);
    await tx.wait();
    fetchTasks(contract);
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Blockchain Task Manager</h1>
      <div className="mb-4">
        <input className="border p-2 mr-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border p-2 mr-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <div>
        {tasks.map((task, index) => (
          <Card key={index} className="p-4 my-2">
            <h3 className="font-bold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.completed ? "✅ Completed" : "❌ Pending"}</p>
            {!task.completed && <Button onClick={() => completeTask(task.id)}>Mark Complete</Button>}
            <Button onClick={() => deleteTask(task.id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
