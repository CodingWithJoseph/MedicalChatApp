import {Route, Routes} from "react-router-dom";
import Chat from "./pages/Chat.tsx";
import Disclaimer from "./components/Disclaimer";

const App = () => {
    return (
        <div className="flex h-screen w-screen bg-primary">
            <Disclaimer />
            <main className="flex-1 overflow-hidden">
                <Routes>
                    <Route path="/" element={<Chat />} />
                </Routes>
            </main>
        </div>

    )
}

export default App