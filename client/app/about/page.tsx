'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Mail, Code, Palette, Server } from 'lucide-react'

const teamMembers = {
  backend: [
    {
      name: 'Bannawat Runttanarak',
      role: 'Backend Developer',
      github: 'https://github.com/Bannawat01',
      email: 'coach.ra47@gmail.com',
      icon: Server
    },
    {
      name: 'Peeraphat Chompoosi',
      role: 'Backend Developer',
      github: 'https://github.com/Peera-27',
      email: 'crbrsonline@gmail.com',
      icon: Server
    }
  ],
  frontend: [
    {
      name: 'Thanaphat Jangmuewai',
      role: 'Frontend Developer',
      github: 'https://github.com/valphalk2244',
      email: 'zzz056093@gmail.com',
      icon: Palette
    }
  ]
}

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏰 About Albion Online Database
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A comprehensive full-stack application for Albion Online market data and analytics,
            built with modern technologies and powered by the Albion Online community.
          </p>
        </div>

        {/* Project Info */}
        <Card className="mb-12 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Code className="w-6 h-6" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🎯 Features</h3>
                <ul className="space-y-2">
                  <li>• Real-time Albion Online item prices</li>
                  <li>• Historical price data and trends</li>
                  <li>• Gold price tracking</li>
                  <li>• Advanced filtering and pagination</li>
                  <li>• AI-powered chatbot assistant</li>
                  <li>• Google OAuth authentication</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🛠️ Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">Bun</Badge>
                  <Badge variant="secondary">Elysia</Badge>
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">Redis</Badge>
                  <Badge variant="secondary">Docker</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <div className="space-y-8">
          {/* Backend Team */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Server className="w-8 h-8" />
              Backend Developers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {teamMembers.backend.map((member, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <member.icon className="w-6 h-6 text-blue-400" />
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        GitHub
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        Email
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Frontend Team */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Palette className="w-8 h-8" />
              Frontend Developer
            </h2>
            <div className="grid md:grid-cols-1 max-w-md gap-6">
              {teamMembers.frontend.map((member, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <member.icon className="w-6 h-6 text-green-400" />
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        GitHub
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        Email
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Credits */}
        <Card className="mt-12 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">🙏 Credits</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <p className="mb-4">
              This project utilizes data and APIs from the Albion Online community:
            </p>
            <div className="space-y-2">
              <a
                href="https://www.albion-online-data.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 underline"
              >
                • Albion Online Data API
              </a>
              <a
                href="https://wiki.albiononline.com/wiki/API:Render_service"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 underline"
              >
                • Albion Online Wiki API
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Made with ❤️ for the Albion Online community
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AboutPage