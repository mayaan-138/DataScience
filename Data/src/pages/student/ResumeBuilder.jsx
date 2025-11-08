import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Eye, Check, X, FileText } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { mockAuth } from '../../utils/auth';

const FRESHER_TEMPLATES = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Simple, 1-column clean layout with name at top center',
    features: ['Objective', 'Education', 'Skills', 'Projects', 'Certifications'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'single-column',
      sections: ['Objective', 'Education', 'Skills', 'Projects', 'Certifications']
    }
  },
  {
    id: 'classic-border',
    name: 'Classic Border',
    description: 'White center card with thin orange border, elegant two-column layout',
    features: ['Left: Education + Skills', 'Right: Projects + Summary'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'two-column',
      sections: ['Education', 'Skills', 'Projects', 'Summary']
    }
  },
  {
    id: 'creative-profile',
    name: 'Creative Profile',
    description: 'Modern two-tone layout with left panel for photo and contact',
    features: ['Left: Photo + Contact + Skills', 'Right: Summary + Projects + Education'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'two-tone',
      sections: ['Photo', 'Contact', 'Skills', 'Summary', 'Projects', 'Education']
    }
  }
];

const EXPERIENCED_TEMPLATES = [
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Two-column structured layout with sharp corners and orange highlights',
    features: ['Left: Experience + Projects', 'Right: Skills + Summary'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'two-column',
      sections: ['Experience', 'Projects', 'Skills', 'Summary']
    }
  },
  {
    id: 'executive-bold',
    name: 'Executive Bold',
    description: 'Bold header with name + title, key highlights section at top',
    features: ['Bold Header', 'Key Highlights', 'Timeline Experience', 'Achievements'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'timeline',
      sections: ['Header', 'Highlights', 'Experience', 'Achievements']
    }
  },
  {
    id: 'modern-timeline',
    name: 'Modern Timeline',
    description: 'Vertical timeline layout with orange dots and lines for chronology',
    features: ['Timeline Experience', 'Projects', 'Achievements', 'Professional Look'],
    color: 'bg-[#DC4D01]',
    preview: {
      layout: 'vertical-timeline',
      sections: ['Timeline', 'Projects', 'Achievements']
    }
  }
];

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fresher'); // 'fresher' or 'experienced'
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const user = mockAuth.getCurrentUser();

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Store template selection in Firestore
      if (user) {
        const selectionRef = doc(db, 'resume_selections', user.uid);
        await setDoc(selectionRef, {
          user_id: user.uid,
          template_type: activeTab === 'fresher' ? 'Fresher' : 'Experienced',
          selected_template: template.name,
          template_id: template.id,
          selected_at: new Date().toISOString()
        }, { merge: true });
      }

      // Also store in localStorage for immediate access
      localStorage.setItem('selectedResumeTemplate', JSON.stringify({
        type: activeTab === 'fresher' ? 'Fresher' : 'Experienced',
        template: template.name,
        template_id: template.id
      }));

      // Navigate to editor with template info
      navigate(`/resume/editor?type=${activeTab}&template=${template.id}`);
    } catch (error) {
      console.error('Error saving template selection:', error);
      // Still navigate even if save fails
      navigate(`/resume/editor?type=${activeTab}&template=${template.id}`);
    }
  };

  const renderTemplatePreview = (template) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 ${template.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
            <FileText className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
        
        <div className="border-2 border-orange-500 rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            {template.preview.sections.map((section, idx) => (
              <div key={idx} className="bg-white p-3 rounded border-l-4 border-orange-500">
                <div className="text-sm font-semibold text-gray-700">{section}</div>
                <div className="text-xs text-gray-500 mt-1">Sample content area</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-2">Features:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {template.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const templates = activeTab === 'fresher' ? FRESHER_TEMPLATES : EXPERIENCED_TEMPLATES;

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FileText size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">🎨 Choose Your Resume Template</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-gray-900 rounded-lg p-2 border border-gray-800">
          <button
            onClick={() => setActiveTab('fresher')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'fresher'
                ? 'bg-primary text-white button-glow'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <GraduationCap size={20} />
            <span>🧑‍🎓 Fresher Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('experienced')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'experienced'
                ? 'bg-primary text-white button-glow'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Briefcase size={20} />
            <span>💼 Experienced Templates</span>
          </button>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-primary transition-all"
            >
              {/* Thumbnail */}
              <div className="mb-4">
                <div className={`w-full h-32 ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                  <FileText className="text-white" size={48} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
              </div>

              {/* Features List */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-semibold mb-2">Features:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {template.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(template)}
                  className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleSelectTemplate(template)}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Select</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Preview: {previewTemplate.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {renderTemplatePreview(previewTemplate)}
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="py-2 px-6 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="py-2 px-6 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
                >
                  Select This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
