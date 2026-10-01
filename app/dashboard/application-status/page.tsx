'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Shield, 
  Smartphone, 
  FileText, 
  ChevronRight,
  Loader2,
  Upload,
  Phone,
  Camera,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'

interface ApplicationStatus {
  id: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  id_verified: boolean;
  phone_verified: boolean;
  guidelines_accepted: boolean;
  submitted_at: string;
  rejection_reason?: string;
}

export default function ApplicationStatusPage() {
  const { user } = useAuth()
  const [application, setApplication] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guidelines, setGuidelines] = useState({
    community: false,
    content: false,
    legal: false,
    safety: false
  })

  const supabase = createClient()

  useEffect(() => {
    loadApplicationStatus()
  }, [user])

  const loadApplicationStatus = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('maker_applications')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      setApplication(data)
      // Determine current step
      if (!data.id_verified) setCurrentStep(1)
      else if (!data.phone_verified) setCurrentStep(2)
      else if (!data.guidelines_accepted) setCurrentStep(3)
      else setCurrentStep(4)
    }
    setLoading(false)
  }

  const handleSendVerificationCode = async () => {
    setIsSubmitting(true)
    // In production, this would call an API to send SMS
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert('Verification code sent! (Demo: use 123456)')
  }

  const handleVerifyPhone = async () => {
    setIsSubmitting(true)
    const { error } = await supabase
      .from('maker_applications')
      .update({ 
        phone_verified: true,
        phone_number: phoneNumber 
      })
      .eq('user_id', user?.id)
    
    if (!error) {
      setCurrentStep(3)
      loadApplicationStatus()
    }
    setIsSubmitting(false)
  }

  const handleAcceptGuidelines = async () => {
    setIsSubmitting(true)
    const { error } = await supabase
      .from('maker_applications')
      .update({ 
        guidelines_accepted: true,
        guidelines_accepted_at: new Date().toISOString()
      })
      .eq('user_id', user?.id)
    
    if (!error) {
      setCurrentStep(4)
      loadApplicationStatus()
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif italic text-noir-50 mb-4">Application Status</h1>
        <div className="card-glass p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-noir-100 mb-2">No Application Found</h2>
          <p className="text-noir-400 mb-6">You haven't submitted a maker application yet.</p>
          <Link href="/maker/signup" className="btn-primary">
            Apply to Become a Maker
          </Link>
        </div>
      </div>
    )
  }

  if (application.status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif italic text-noir-50 mb-4">Application Status</h1>
        <div className="card-glass p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-noir-100 mb-2">You're Approved!</h2>
          <p className="text-noir-400 mb-6">
            Congratulations! Your maker account has been approved. You can now start selling.
          </p>
          <Link href="/dashboard/products/new" className="btn-primary">
            Add Your First Product
          </Link>
        </div>
      </div>
    )
  }

  if (application.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif italic text-noir-50 mb-4">Application Status</h1>
        <div className="card-glass p-8 text-center">
          <AlertCircle className="w-16 h-16 text-rose mx-auto mb-4" />
          <h2 className="text-xl font-medium text-noir-100 mb-2">Application Rejected</h2>
          <p className="text-noir-400 mb-4">
            Unfortunately, your application was not approved at this time.
          </p>
          {application.rejection_reason && (
            <div className="bg-noir-950 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-noir-300">Reason:</p>
              <p className="text-noir-100">{application.rejection_reason}</p>
            </div>
          )}
          <Link href="/maker/signup" className="btn-secondary">
            Reapply
          </Link>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, title: 'Identity Verification', icon: Shield },
    { id: 2, title: 'Phone Verification', icon: Smartphone },
    { id: 3, title: 'Community Guidelines', icon: FileText },
    { id: 4, title: 'Review', icon: Clock },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-serif italic text-noir-50 mb-2">Complete Your Application</h1>
      <p className="text-noir-400 mb-8">Finish these steps to get your shop approved</p>

      {/* Progress Steps */}
      <div className="flex mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          
          return (
            <div key={step.id} className="flex-1 relative">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'after:content-[""] after:absolute after:top-5 after:left-[60%] after:w-[80%] after:h-0.5 after:bg-noir-800' : ''}`}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 relative
                  ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                  ${isActive ? 'bg-rose text-white ring-2 ring-rose ring-offset-2 ring-offset-noir-950' : ''}
                  ${!isCompleted && !isActive ? 'bg-noir-800 text-noir-400' : ''}
                `}>
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs ${isActive ? 'text-rose' : 'text-noir-400'}`}>
                  {step.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="card-glass p-8">
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-rose" />
              <div>
                <h2 className="text-xl font-medium text-noir-100">Identity Verification</h2>
                <p className="text-sm text-noir-400">Verify your identity to protect our community</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-noir-950 p-6 rounded-xl border border-noir-800">
                <div className="flex items-start gap-4">
                  <Camera className="w-6 h-6 text-rose mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-noir-100 mb-1">Photo ID Upload</h3>
                    <p className="text-sm text-noir-400 mb-3">
                      Upload a photo of your government-issued ID (driver's license, passport, etc.)
                    </p>
                    <button className="btn-secondary text-sm">
                      <Upload size={16} className="inline mr-2" />
                      Upload ID Photo
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-noir-950 p-6 rounded-xl border border-noir-800">
                <div className="flex items-start gap-4">
                  <UserCheck className="w-6 h-6 text-rose mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-noir-100 mb-1">Selfie Verification</h3>
                    <p className="text-sm text-noir-400 mb-3">
                      Take a selfie to verify you match your ID photo
                    </p>
                    <button className="btn-secondary text-sm">
                      <Camera size={16} className="inline mr-2" />
                      Take Selfie
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => {
                    // Demo: mark as verified
                    supabase.from('maker_applications').update({ id_verified: true }).eq('user_id', user?.id).then(() => {
                      setCurrentStep(2)
                      loadApplicationStatus()
                    })
                  }}
                  className="btn-primary"
                >
                  Continue <ChevronRight size={16} className="inline" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-8 h-8 text-rose" />
              <div>
                <h2 className="text-xl font-medium text-noir-100">Phone Verification</h2>
                <p className="text-sm text-noir-400">Verify your phone number for security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-2">Phone Number</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" size={18} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-noir-950 border border-noir-800 rounded-lg pl-10 pr-4 py-3 text-noir-100 focus:border-rose outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSendVerificationCode}
                    disabled={isSubmitting || !phoneNumber}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Send Code'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-noir-300 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-noir-950 border border-noir-800 rounded-lg px-4 py-3 text-noir-100 focus:border-rose outline-none"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="btn-ghost"
                >
                  Back
                </button>
                <button 
                  onClick={handleVerifyPhone}
                  disabled={isSubmitting || verificationCode.length < 6}
                  className="btn-primary"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Continue'}
                  <ChevronRight size={16} className="inline" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-rose" />
              <div>
                <h2 className="text-xl font-medium text-noir-100">Community Guidelines</h2>
                <p className="text-sm text-noir-400">Read and accept our guidelines</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-noir-950 p-4 rounded-xl border border-noir-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.community}
                    onChange={(e) => setGuidelines({...guidelines, community: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium text-noir-100">Community Standards</h4>
                    <p className="text-sm text-noir-400">
                      I agree to treat all community members with respect and dignity. 
                      I will not engage in harassment, discrimination, or harmful behavior.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-noir-950 p-4 rounded-xl border border-noir-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.content}
                    onChange={(e) => setGuidelines({...guidelines, content: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium text-noir-100">Content Policy</h4>
                    <p className="text-sm text-noir-400">
                      I understand that all products must comply with our content guidelines. 
                      I will not list prohibited items or inappropriate content.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-noir-950 p-4 rounded-xl border border-noir-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.legal}
                    onChange={(e) => setGuidelines({...guidelines, legal: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium text-noir-100">Legal Compliance</h4>
                    <p className="text-sm text-noir-400">
                      I confirm that I am of legal age and all products I sell comply with 
                      applicable laws in my jurisdiction.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-noir-950 p-4 rounded-xl border border-noir-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.safety}
                    onChange={(e) => setGuidelines({...guidelines, safety: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium text-noir-100">Safety & Responsibility</h4>
                    <p className="text-sm text-noir-400">
                      I understand the importance of safety in adult products and will 
                      provide accurate product descriptions and safety information.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setCurrentStep(2)}
                className="btn-ghost"
              >
                Back
              </button>
              <button 
                onClick={handleAcceptGuidelines}
                disabled={isSubmitting || !Object.values(guidelines).every(Boolean)}
                className="btn-primary"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Complete Application'}
                <ChevronRight size={16} className="inline" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-rose" />
              <div>
                <h2 className="text-xl font-medium text-noir-100">Under Review</h2>
                <p className="text-sm text-noir-400">Your application is being reviewed</p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 font-medium">All Steps Completed</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-noir-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Identity verified</span>
                </div>
                <div className="flex items-center gap-2 text-noir-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Phone verified</span>
                </div>
                <div className="flex items-center gap-2 text-noir-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Community guidelines accepted</span>
                </div>
              </div>
            </div>

            <p className="text-noir-300 mb-4">
              Thank you for completing the verification process! Our team is now reviewing 
              your application. You'll receive an email notification once your shop is approved.
            </p>

            <p className="text-noir-400 text-sm">
              Typical review time: 1-2 business days
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
