import {Navigate, Route, Routes} from "react-router-dom";
import Chat from "./pages/Chat";
import NewChat from "./pages/NewChat";


const App = () => {
    return (
        <div className="flex h-screen w-screen bg-primary">
            {/*<Sidebar />*/}
            <main className="flex-1 overflow-hidden">
                <Routes>
                    <Route path="/" element={<Navigate to="/new" />} />
                    <Route path="/new" element={<NewChat />} />
                    <Route path="/chat/:id" element={<Chat />} />
                </Routes>
            </main>
        </div>
    )
}

export default App