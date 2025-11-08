import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, mockAuth } from '../../utils/auth';
import { db } from '../../firebase/config';
import { FolderKanban, Upload, CheckCircle, Clock, XCircle, Plus, X, Github, FileCode, Database, Code } from 'lucide-react';

export default function ProjectLab() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    githubLink: '',
    notebookLink: '',
    datasetUsed: '',
    technologyStack: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Show page immediately, load data in background
    setLoading(false);
    
    const fetchProjects = async () => {
      try {
        // Add timeout to prevent hanging (1 second max)
        const querySnapshot = await Promise.race([
          getDocs(collection(db, 'projects')),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        ]);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsData);
      } catch (error) {
        // Firestore is optional - show empty state
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'in-progress':
        return <Clock size={20} className="text-yellow-400" />;
      case 'pending':
        return <XCircle size={20} className="text-gray-400" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 border-green-500';
      case 'in-progress':
        return 'bg-yellow-900/20 border-yellow-500';
      case 'pending':
        return 'bg-gray-900 border-gray-700';
      default:
        return 'bg-gray-900 border-gray-700';
    }
  };

  const validateURL = (url) => {
    if (!url) return true; // Optional fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Project category is required';
    }
    
    if (!formData.githubLink.trim()) {
      newErrors.githubLink = 'GitHub repository link is required';
    } else if (!validateURL(formData.githubLink)) {
      newErrors.githubLink = 'Please enter a valid URL';
    }
    
    if (formData.notebookLink && !validateURL(formData.notebookLink)) {
      newErrors.notebookLink = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const projectData = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        githubLink: formData.githubLink.trim(),
        notebookLink: formData.notebookLink.trim() || '',
        datasetUsed: formData.datasetUsed.trim() || '',
        technologyStack: formData.technologyStack.trim() || '',
        status: 'pending',
        difficulty: formData.category === 'Advanced Statistics' ? 'Advanced' : 
                   formData.category === 'Machine Learning' ? 'Intermediate' : 
                   formData.category === 'Deep Learning' ? 'Advanced' : 'Intermediate',
        createdAt: new Date().toISOString(),
        submittedBy: user?.email || user?.uid || 'anonymous',
      };
      
      await addDoc(collection(db, 'projects'), projectData);
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        githubLink: '',
        notebookLink: '',
        datasetUsed: '',
        technologyStack: '',
      });
      setErrors({});
      setShowModal(false);
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      
      // Refresh projects list
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors({ submit: 'Error saving project. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      githubLink: '',
      notebookLink: '',
      datasetUsed: '',
      technologyStack: '',
    });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FolderKanban size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Project Lab</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <FolderKanban size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No projects available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`bg-gray-900 rounded-lg p-6 border ${getStatusColor(
                  project.status
                )} glow-on-hover`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        project.difficulty === 'Beginner'
                          ? 'bg-green-900 text-green-300'
                          : project.difficulty === 'Intermediate'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {project.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{project.description || ''}</p>

                {project.dataset_link && (
                  <div className="mb-4">
                    <a
                      href={project.dataset_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Download Dataset →
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                    <Upload size={18} />
                    Submit Solution
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-primary text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <span className="text-2xl">🎉</span>
          <span>Project added successfully! Check it in your Project Lab.</span>
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-primary/30 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ boxShadow: '0 0 30px rgba(220, 77, 1, 0.3)' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Add New Project</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Section 1: Basic Project Details */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                  Section 1: Basic Project Details
                </h3>
                <div className="space-y-4">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Title <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none transition-all text-white ${
                        errors.title
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      placeholder="e.g. Customer Segmentation using K-Means"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Project Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Category <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none transition-all text-white ${
                        errors.category
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    >
                      <option value="">Select a category</option>
                      <option value="Advanced Statistics">Advanced Statistics</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Deep Learning">Deep Learning</option>
                      <option value="Generative AI">Generative AI</option>
                    </select>
                    {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white resize-none"
                      placeholder="This project segments customers based on shopping habits using K-Means algorithm."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Details */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-primary/30">
                  Section 2: Technical Details
                </h3>
                <div className="space-y-4">
                  {/* GitHub Repository Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Github className="inline-block mr-2" size={16} />
                      GitHub Repository Link <span className="text-primary">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.githubLink}
                      onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                      className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none transition-all text-white ${
                        errors.githubLink
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      placeholder="https://github.com/student/project-ds"
                    />
                    {errors.githubLink && <p className="text-red-400 text-sm mt-1">{errors.githubLink}</p>}
                  </div>

                  {/* Colab / Notebook Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileCode className="inline-block mr-2" size={16} />
                      Colab / Notebook Link
                    </label>
                    <input
                      type="url"
                      value={formData.notebookLink}
                      onChange={(e) => setFormData({ ...formData, notebookLink: e.target.value })}
                      className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none transition-all text-white ${
                        errors.notebookLink
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      placeholder="https://colab.research.google.com/..."
                    />
                    {errors.notebookLink && <p className="text-red-400 text-sm mt-1">{errors.notebookLink}</p>}
                  </div>

                  {/* Dataset Used */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Database className="inline-block mr-2" size={16} />
                      Dataset Used (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.datasetUsed}
                      onChange={(e) => setFormData({ ...formData, datasetUsed: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white"
                      placeholder="Kaggle - Mall Customers Dataset"
                    />
                  </div>

                  {/* Technology Stack */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Code className="inline-block mr-2" size={16} />
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      value={formData.technologyStack}
                      onChange={(e) => setFormData({ ...formData, technologyStack: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white"
                      placeholder="Python, Pandas, Scikit-learn"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
