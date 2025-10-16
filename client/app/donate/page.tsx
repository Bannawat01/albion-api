'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Coffee, Star, Gift, DollarSign } from 'lucide-react'

const DonatePage: React.FC = () => {
  const donationOptions = [
      {
        amount: '1',
        title: 'Supporter',
        description: 'Monthly support 💝',
        icon: Heart,
        color: 'from-pink-500 to-red-600',
        buttonId: 'PEWY3UYKKZV42',
        popular: false
      },
      {
        amount: '5',
        title: 'VIP Supporter',
        description: 'Enhanced support ⭐',
        icon: Star,
        color: 'from-blue-500 to-purple-600',
        buttonId: 'B8C8DG8UL48A6',
        popular: true
      }
    ]

  const handleDonate = (buttonId: string) => {
    // PayPal subscription button
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${buttonId}`

    window.open(paypalUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            ☕ Support Our Project
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Help us keep the Albion Online Database running and growing.
            Your support helps us maintain servers, improve features, and keep the service free for everyone.
          </p>
        </div>

        {/* Why Donate */}
        <Card className="mb-12 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-400" />
              Why Your Support Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">💰 Server Costs</h3>
                <ul className="space-y-2">
                  <li>• Database hosting and maintenance</li>
                  <li>• API rate limiting and caching</li>
                  <li>• SSL certificates and security</li>
                  <li>• CDN and performance optimization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🚀 Future Development</h3>
                <ul className="space-y-2">
                  <li>• New features and improvements</li>
                  <li>• Better mobile experience</li>
                  <li>• Advanced analytics and charts</li>
                  <li>• Community requested features</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Your Support Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto gap-4">
            {donationOptions.map((option, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 glass-card hover:scale-105"
              >
                <CardContent className="pt-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">{option.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{option.description}</p>
                  <div className="text-2xl font-bold text-white mb-4">${option.amount}</div>
                  <Button
                    onClick={() => handleDonate(option.buttonId)}
                    className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
                  >
                    Subscribe for ${option.amount}/month
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Thank You */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">🙏 Thank You!</h3>
            <p className="text-slate-300 mb-4">
              Every contribution, no matter the size, makes a difference.
              Thank you for supporting the Albion Online community!
            </p>
            <div className="flex justify-center gap-2 text-2xl">
              <Heart className="text-red-400 animate-pulse" />
              <Coffee className="text-amber-400 animate-pulse" />
              <Star className="text-blue-400 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DonatePage