import {FC} from 'react';
import {MessageCirclePlus, MessageSquareHeart, ChevronDown} from 'lucide-react'

interface SidebarProps {
}

const Sidebar: FC<SidebarProps> = ({}) => {
    return (
        <div className="flex flex-col items-center justify-between w-12 h-screen border-r border-solid border-border p-4">
            <div className='flex flex-col items-center gap-4'>
                <button className="group relative text-gray-400 hover:text-white transition-colors">
                    <MessageCirclePlus size={22}/>
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 py-1 px-2 rounded-xs bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        New Chat
                    </span>
                </button>
                <button className="text-gray-400 hover:text-white">
                    <MessageSquareHeart size={22}/>
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 py-1 px-2 rounded-xs bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Chats
                    </span>
                </button>
                <button className="text-gray-400 hover:text-white m-4">
                    for
                    <ChevronDown size={24}/>
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 py-1 px-2 rounded-xs bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Chats
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
