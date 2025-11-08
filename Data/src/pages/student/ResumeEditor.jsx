import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, User, Mail, Phone, Linkedin, Github } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { callGemini } from '../../utils/geminiClient';

export default function ResumeEditor() {
  const [searchParams] = useSearchParams();
  const templateType = searchParams.get('type') || 'fresher';
  const selectedTemplate = searchParams.get('template') || null;
  const navigate = useNavigate();
  const previewRef = useRef(null);

  // Load template selection from localStorage if available
  const [templateSelection, setTemplateSelection] = useState(() => {
    const stored = localStorage.getItem('selectedResumeTemplate');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Use selected template if available
  const currentTemplate = selectedTemplate || templateSelection?.template_id || null;
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    
    // Fresher Template
    objective: '',
    education: [{ degree: '', college: '', year: '', cgpa: '' }],
    skills: '',
    projects: [{ title: '', description: '', technologies: '' }],
    certifications: [{ name: '', issuer: '', date: '' }],
    interests: '',
    
    // Experienced Template
    professionalSummary: '',
    experience: [{ company: '', role: '', duration: '', description: '' }],
    achievements: '',
    technicalSkills: '',
    toolsTechnologies: '',
    certificationsAwards: [{ name: '', issuer: '', date: '' }],
  });

  const GEMINI_MODEL = 'gemini-2.0-flash-exp';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, ...value } : item)
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAIAutoFill = async () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }

    setAiLoading(true);

    try {
      const prompt = templateType === 'fresher' 
        ? `Generate a professional resume content for a ${selectedRole} fresher/entry-level position. Include:
1. A compelling objective/summary (2-3 sentences)
2. Relevant skills (comma-separated list of 8-10 skills)
3. 2-3 academic project descriptions (each with title, description, and technologies used)
4. 2-3 relevant certifications (name, issuer, date)

Format the response as JSON with keys: objective, skills, projects (array with title, description, technologies), certifications (array with name, issuer, date).
Make it realistic and tailored for Data Science roles.`
        : `Generate a professional resume content for an experienced ${selectedRole}. Include:
1. A compelling professional summary (3-4 sentences highlighting experience and expertise)
2. Technical skills (comma-separated list of 10-12 skills)
3. Tools & Technologies (comma-separated list)
4. Key achievements (5-6 bullet points)
5. 2-3 work experience entries (company, role, duration, description with achievements)

Format the response as JSON with keys: professionalSummary, technicalSkills, toolsTechnologies, achievements (array of strings), experience (array with company, role, duration, description).
Make it realistic and tailored for Data Science roles.`;

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const data = await callGemini({
        model: GEMINI_MODEL,
        contents: requestBody.contents,
        generationConfig: requestBody.generationConfig,
      });
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        
        if (templateType === 'fresher') {
          setFormData(prev => ({
            ...prev,
            objective: aiData.objective || '',
            skills: aiData.skills || '',
            projects: aiData.projects || prev.projects,
            certifications: aiData.certifications || prev.certifications,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            professionalSummary: aiData.professionalSummary || '',
            technicalSkills: aiData.technicalSkills || '',
            toolsTechnologies: aiData.toolsTechnologies || '',
            achievements: Array.isArray(aiData.achievements) ? aiData.achievements.join('\n') : (aiData.achievements || ''),
            experience: aiData.experience || prev.experience,
            certificationsAwards: aiData.certifications || prev.certificationsAwards,
          }));
        }
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${formData.fullName || 'resume'}-resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/resume')}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Templates</span>
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Download size={18} />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Template Info Banner */}
        {currentTemplate && (
          <div className="bg-gray-900 rounded-lg border border-primary/50 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Template:</p>
                <p className="text-lg font-semibold text-primary capitalize">
                  {currentTemplate.replace(/-/g, ' ')}
                </p>
              </div>
              <button
                onClick={() => navigate('/resume')}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Change Template
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {templateType === 'fresher' ? 'Fresher Resume' : 'Experienced Resume'}
              </h2>
              
              {/* AI Auto Fill */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select Role</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="AI Developer">AI Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
                <button
                  onClick={handleAIAutoFill}
                  disabled={aiLoading || !selectedRole}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <Sparkles size={16} />
                  {aiLoading ? 'Generating...' : 'AI Auto Fill'}
                </button>
              </div>
            </div>

            <form className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="inline-block mr-2" size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="inline-block mr-2" size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="john.doe@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="inline-block mr-2" size={16} />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Linkedin className="inline-block mr-2" size={16} />
                      LinkedIn (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Github className="inline-block mr-2" size={16} />
                      GitHub (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="https://github.com/johndoe"
                    />
                  </div>
                </div>
              </div>

              {/* Template-specific sections */}
              {templateType === 'fresher' ? (
                <>
                  {/* Objective */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Objective / Summary
                    </h3>
                    <textarea
                      value={formData.objective}
                      onChange={(e) => handleInputChange('objective', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
                      placeholder="Passionate Data Science graduate seeking opportunities..."
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30 flex items-center justify-between">
                      <span>Education</span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('education', { degree: '', college: '', year: '', cgpa: '' })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add
                      </button>
                    </h3>
                    {formData.education.map((edu, index) => (
                      <div key={index} className="mb-4 p-4 bg-black rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-primary text-sm">Education #{index + 1}</span>
                          {formData.education.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('education', index)}
                              className="text-red-400 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleArrayChange('education', index, { degree: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Degree (e.g., B.Tech Computer Science)"
                          />
                          <input
                            type="text"
                            value={edu.college}
                            onChange={(e) => handleArrayChange('education', index, { college: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="College/University"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => handleArrayChange('education', index, { year: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                              placeholder="Year (e.g., 2024)"
                            />
                            <input
                              type="text"
                              value={edu.cgpa}
                              onChange={(e) => handleArrayChange('education', index, { cgpa: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                              placeholder="CGPA (e.g., 8.5/10)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Skills
                    </h3>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="Python, Pandas, Machine Learning, SQL, Tableau"
                    />
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30 flex items-center justify-between">
                      <span>Academic Projects</span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('projects', { title: '', description: '', technologies: '' })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add
                      </button>
                    </h3>
                    {formData.projects.map((project, index) => (
                      <div key={index} className="mb-4 p-4 bg-black rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-primary text-sm">Project #{index + 1}</span>
                          {formData.projects.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('projects', index)}
                              className="text-red-400 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => handleArrayChange('projects', index, { title: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Project Title"
                          />
                          <textarea
                            value={project.description}
                            onChange={(e) => handleArrayChange('projects', index, { description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm resize-none"
                            placeholder="Project description..."
                          />
                          <input
                            type="text"
                            value={project.technologies}
                            onChange={(e) => handleArrayChange('projects', index, { technologies: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Technologies used (e.g., Python, TensorFlow)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30 flex items-center justify-between">
                      <span>Certifications</span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add
                      </button>
                    </h3>
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="mb-4 p-4 bg-black rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-primary text-sm">Certification #{index + 1}</span>
                          {formData.certifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('certifications', index)}
                              className="text-red-400 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleArrayChange('certifications', index, { name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Certification Name"
                          />
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleArrayChange('certifications', index, { issuer: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Issuer (e.g., Coursera, Google)"
                          />
                          <input
                            type="text"
                            value={cert.date}
                            onChange={(e) => handleArrayChange('certifications', index, { date: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Date (e.g., Jan 2024)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interests */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Interests (optional)
                    </h3>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => handleInputChange('interests', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="Reading, Data Visualization, Open Source"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Professional Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Professional Summary
                    </h3>
                    <textarea
                      value={formData.professionalSummary}
                      onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
                      placeholder="Experienced Data Scientist with expertise in..."
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30 flex items-center justify-between">
                      <span>Work Experience</span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', description: '' })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add
                      </button>
                    </h3>
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="mb-4 p-4 bg-black rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-primary text-sm">Experience #{index + 1}</span>
                          {formData.experience.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('experience', index)}
                              className="text-red-400 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleArrayChange('experience', index, { company: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Company Name"
                          />
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleArrayChange('experience', index, { role: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Job Role/Title"
                          />
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleArrayChange('experience', index, { duration: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Duration (e.g., Jan 2020 - Present)"
                          />
                          <textarea
                            value={exp.description}
                            onChange={(e) => handleArrayChange('experience', index, { description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm resize-none"
                            placeholder="Job description and achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Key Achievements
                    </h3>
                    <textarea
                      value={formData.achievements}
                      onChange={(e) => handleInputChange('achievements', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
                      placeholder="• Achievement 1&#10;• Achievement 2&#10;• Achievement 3"
                    />
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Technical Skills
                    </h3>
                    <input
                      type="text"
                      value={formData.technicalSkills}
                      onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="Python, SQL, Machine Learning, Deep Learning"
                    />
                  </div>

                  {/* Tools & Technologies */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                      Tools & Technologies
                    </h3>
                    <input
                      type="text"
                      value={formData.toolsTechnologies}
                      onChange={(e) => handleInputChange('toolsTechnologies', e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                      placeholder="TensorFlow, PyTorch, AWS, Docker, Kubernetes"
                    />
                  </div>

                  {/* Certifications & Awards */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-primary/30 flex items-center justify-between">
                      <span>Certifications & Awards</span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('certificationsAwards', { name: '', issuer: '', date: '' })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add
                      </button>
                    </h3>
                    {formData.certificationsAwards.map((cert, index) => (
                      <div key={index} className="mb-4 p-4 bg-black rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-primary text-sm">Certification #{index + 1}</span>
                          {formData.certificationsAwards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('certificationsAwards', index)}
                              className="text-red-400 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleArrayChange('certificationsAwards', index, { name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Certification/Award Name"
                          />
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleArrayChange('certificationsAwards', index, { issuer: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Issuer"
                          />
                          <input
                            type="text"
                            value={cert.date}
                            onChange={(e) => handleArrayChange('certificationsAwards', index, { date: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white text-sm"
                            placeholder="Date"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">Live Preview</h2>
            <div className="bg-white rounded-lg p-6 shadow-lg" ref={previewRef} style={{ minHeight: '800px' }}>
              {templateType === 'fresher' ? (
                <FresherTemplatePreview data={formData} />
              ) : (
                <ExperiencedTemplatePreview data={formData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fresher Template Preview Component
function FresherTemplatePreview({ data }) {
  return (
    <div className="text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold mb-2">{data.fullName || 'Your Name'}</h1>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.linkedin && <span>• LinkedIn</span>}
          {data.github && <span>• GitHub</span>}
        </div>
      </div>

      {/* Objective */}
      {data.objective && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-primary" style={{ color: '#DC4D01' }}>OBJECTIVE</h2>
          <p className="text-sm leading-relaxed">{data.objective}</p>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && data.education[0].degree && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.college}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{edu.year}</p>
                  {edu.cgpa && <p className="text-sm text-gray-600">CGPA: {edu.cgpa}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>SKILLS</h2>
          <p className="text-sm">{data.skills}</p>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && data.projects[0].title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>ACADEMIC PROJECTS</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <p className="font-semibold">{project.title}</p>
              <p className="text-sm text-gray-700 mb-1">{project.description}</p>
              {project.technologies && (
                <p className="text-xs text-gray-600 italic">Technologies: {project.technologies}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && data.certifications[0].name && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>CERTIFICATIONS</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold text-sm">{cert.name}</p>
              <p className="text-xs text-gray-600">{cert.issuer} {cert.date && `• ${cert.date}`}</p>
            </div>
          ))}
        </div>
      )}

      {/* Interests */}
      {data.interests && (
        <div>
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>INTERESTS</h2>
          <p className="text-sm">{data.interests}</p>
        </div>
      )}
    </div>
  );
}

// Experienced Template Preview Component
function ExperiencedTemplatePreview({ data }) {
  return (
    <div className="text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold mb-2">{data.fullName || 'Your Name'}</h1>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.linkedin && <span>• LinkedIn</span>}
          {data.github && <span>• GitHub</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-primary" style={{ color: '#DC4D01' }}>PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed">{data.professionalSummary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && data.experience[0].company && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>WORK EXPERIENCE</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-semibold">{exp.role}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                </div>
                <p className="text-sm text-gray-600">{exp.duration}</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {data.achievements && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>KEY ACHIEVEMENTS</h2>
          <div className="text-sm whitespace-pre-line">{data.achievements}</div>
        </div>
      )}

      {/* Technical Skills */}
      {data.technicalSkills && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>TECHNICAL SKILLS</h2>
          <p className="text-sm">{data.technicalSkills}</p>
        </div>
      )}

      {/* Tools & Technologies */}
      {data.toolsTechnologies && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>TOOLS & TECHNOLOGIES</h2>
          <p className="text-sm">{data.toolsTechnologies}</p>
        </div>
      )}

      {/* Certifications & Awards */}
      {data.certificationsAwards && data.certificationsAwards.length > 0 && data.certificationsAwards[0].name && (
        <div>
          <h2 className="text-xl font-bold mb-3 text-primary" style={{ color: '#DC4D01' }}>CERTIFICATIONS & AWARDS</h2>
          {data.certificationsAwards.map((cert, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold text-sm">{cert.name}</p>
              <p className="text-xs text-gray-600">{cert.issuer} {cert.date && `• ${cert.date}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

