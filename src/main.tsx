import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import {MantineProvider} from '@mantine/core'
import {Notifications} from '@mantine/notifications'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MantineProvider>
                    <Notifications />
                    <App />
                </MantineProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
