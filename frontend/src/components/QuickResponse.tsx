import React from 'react'

function QuickResponse() {
    return (
        <div className="px-6 py-6 flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-green-400 mb-2">self_improvement</span>
                    Anxiety coping strategies
                </button>
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-blue-400 mb-2">psychology_alt</span>
                    Depression resources
                </button>
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-purple-400 mb-2">hotel</span>
                    Sleep improvement
                </button>
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-yellow-400 mb-2">spa</span>
                    Stress management
                </button>
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-pink-400 mb-2">favorite</span>
                    Self-care tips
                </button>
                <button className="flex flex-col items-center justify-center px-6 py-6 bg-white hover:bg-green-50 text-gray-700 text-sm rounded-2xl border border-gray-200 transition-all hover:shadow-md font-medium">
                    <span className="material-symbols-outlined text-3xl text-indigo-400 mb-2">groups</span>
                    Support groups
                </button>
            </div>
        </div>
    )
}

export default QuickResponse