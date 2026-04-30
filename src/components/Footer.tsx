// components/Footer.tsx
const Footer = () => {
    return (
        <div className="text-center text-xs sm:text-sm text-gray-400 py-2 px-4 space-y-1.5">
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
                <span className="text-gray-200 font-medium">Team</span>
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
                    <span key={name} className="text-gray-400">{name}</span>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-x-4 gap-y-1">
                <span><span className="text-gray-200">Team Lead</span> <span className="text-gray-400">Kenia Sanchez-Macario</span></span>
                <span>
                    <span className="text-gray-200">Advisor </span>
                    <a href="https://sites.google.com/view/yuqingzhu/" target="_blank" rel="noopener noreferrer"
                       className="text-[#3B9EFF] hover:text-blue-300 transition-colors">
                        Dr. Yuqing Zhu (CSULA)
                    </a>
                </span>
                <span>
                    <span className="text-gray-200">Liaison </span>
                    <a href="https://cedars.nationalcampus.ai/people/#people-coaches" target="_blank" rel="noopener noreferrer"
                       className="text-[#3B9EFF] hover:text-blue-300 transition-colors">
                        Yimeng He (National AI Campus Coach)
                    </a>
                </span>
                <span><span className="text-gray-200">Course</span> <span className="text-gray-400">Senior Design · Cal State LA</span></span>
            </div>
        </div>
    );
};

export default Footer;