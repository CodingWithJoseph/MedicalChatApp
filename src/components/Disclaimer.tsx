import {useEffect, useState} from "react";
import ChatInput from "./ChatInput.tsx";


const Disclaimer = () => {

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const accepted = sessionStorage.getItem("disclaimer_accepted");
        if (!accepted) setVisible(true);
    }, [])

    const accept = () => {
        sessionStorage.setItem('disclaimer_accepted', 'true')
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
                <h2 className="text-white text-lg font-semibold mb-4">
                    Academic Use Only
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    This tool is intended for <span className="text-white">educational and academic purposes only</span>. It uses a biomedical retrieval system trained on PubMed research abstracts.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    The information provided by this application <span className="text-white">should not be used as medical advice</span> and is not a substitute for professional medical consultation, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.
                </p>
                <button
                    onClick={accept}
                    className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    I understand, continue
                </button>
            </div>
        </div>
    )
}

export default Disclaimer