'use client'
import { useState } from "react"

export default function Home() {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [priority, setPriority] = useState<string>("")

  const [newTask, setNewTask] = useState<boolean>(false)
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="w-30"></div>

        <h1 className="text-4xl font-sans py-2 px-4 bg-blue-300 rounded">
          Kanban
        </h1>

        <button
        className="bg-emerald-800 text-white p-2 mt-2 rounded-4xl hover:bg-blue-600 cursor-pointer w-30"
        onClick={ () => setNewTask(true) }>
          Nova Tarefa
        </button>
      </div>

      {newTask &&
      <form className="mx-auto w-fit flex flex-col">
        <h1 className="text-2xl text-center">Tarefa</h1>
        
        <input
        type="text"
        placeholder="Insira o Título"
        className="bg-gray-50 p-2 border rounded"
        onChange={ (e) => setTitle(e.target.value) }/>

        <input
        type="text"
        placeholder="Insira a Descrição"
        className="bg-gray-50 p-2 border rounded"
        onChange={ (e) => setDescription(e.target.value) }/>
        
        <select
        className="bg-gray-50 p-2 border rounded"
        value={priority}
        onChange={ (e) => setPriority(e.target.value) }>
          <option disabled selected>Selecione a Prioridade</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
        
        <select
        className="bg-gray-50 p-2 border rounded"
        value={status}
        onChange={ (e) => setStatus(e.target.value) }>
          <option disabled selected>Selecione a Categoria</option>
          <option value="fazer">A Fazer</option>
          <option value="andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
        </select>
        <button
        className="bg-emerald-800 text-white p-1 mt-2 rounded-4xl hover:bg-blue-600 cursor-pointer"
        onClick={ () => setNewTask(false)}>
          Cancelar Tarefa
        </button>
      </form>
      }

      <div className="flex flex-row gap-x-52 text-2xl justify-center mt-5">
        <div>
          <h1>A Fazer</h1>
        </div>

        <div>
          <h1>Em Andamento</h1>
        </div>

        <div>
          <h1>Concluído</h1>
        </div>
      </div>

    </div>
  )
}