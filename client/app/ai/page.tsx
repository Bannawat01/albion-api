'use client';

import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('../../components/ChatBot'), {
    ssr: false,
    loading: () => (
        <div className="w-full max-w-2xl mx-auto h-[600px] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">กำลังโหลดแชทบอท...</p>
            </div>
        </div>
    ),
});

export default function AIPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Albion Online AI Assistant</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium mb-2">
                    🚧 Development Version
                </div>
                <p className="text-muted-foreground mt-2">
                    Help you find the best places to buy or sell items in Albion Online
                </p>
            </div>
            <ChatBot />
        </div>
    );
}