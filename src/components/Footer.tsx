const Footer = () => {
    return (
        <div className="text-center text-xs text-gray-600 py-2 px-4 space-y-1">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                <span className="text-gray-500 font-medium">Team</span>
                {[
                    "Christopher Gonzales",
                    "Rocio Hernandez",
                    "Joseph Howerton",
                    "Yvan Michel Kemsseu Yobeu",
                    "Haonan Ma",
                    "Steven Magana",
                    "Alan Mai",
                    "Georgina Mateo",
                    "Laura Rodriguez Zea",
                    "Kenia Sanchez-Macario",
                    "Sean Santos",
                ].map(name => (
                    <span key={name} className="text-gray-600">{name}</span>
                ))}
            </div>
            <div className="flex justify-center gap-4">
                <span><span className="text-gray-500">Team Lead</span> <span className="text-gray-600">Kenia Sanchez-Macario</span></span>
                <span>
                    <span className="text-gray-500">Advisor </span>
                    <a href="https://sites.google.com/view/yuqingzhu/" target="_blank" rel="noopener noreferrer"
                       className="text-[#0070BB] hover:text-blue-300 transition-colors">
                        Dr. Yuqing Zhu (CSULA)
                    </a>
                </span>
                <span><span className="text-gray-500">Liaison</span> <span className="text-gray-600">TBD</span></span>
                <span><span className="text-gray-500">Course</span> <span className="text-gray-600">Senior Design · Cal State LA</span></span>
            </div>
        </div>
    )
}

export default Footer