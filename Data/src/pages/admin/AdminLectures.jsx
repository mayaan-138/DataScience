import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BookOpen, Plus, Edit, Trash2, Video, X } from 'lucide-react';

export default function AdminLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [formData, setFormData] = useState({
    topic_name: '',
    description: '',
    total_videos: 0,
    video_links: [{ title: '', url: '' }],
  });

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'lectures'));
      const lecturesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLectures(lecturesData);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const videoLinks = formData.video_links.filter(
        (link) => link.title.trim() && link.url.trim()
      );

      const lectureData = {
        topic_name: formData.topic_name,
        description: formData.description,
        total_videos: videoLinks.length,
        video_links: videoLinks,
        createdAt: new Date().toISOString(),
      };

      if (editingLecture) {
        await updateDoc(doc(db, 'lectures', editingLecture.id), lectureData);
      } else {
        await addDoc(collection(db, 'lectures'), lectureData);
      }

      setShowModal(false);
      setFormData({
        topic_name: '',
        description: '',
        total_videos: 0,
        video_links: [{ title: '', url: '' }],
      });
      setEditingLecture(null);
      fetchLectures();
    } catch (error) {
      console.error('Error saving lecture:', error);
      alert('Error saving lecture. Please try again.');
    }
  };

  const handleEdit = (lecture) => {
    setEditingLecture(lecture);
    setFormData({
      topic_name: lecture.topic_name || '',
      description: lecture.description || '',
      total_videos: lecture.total_videos || 0,
      video_links: lecture.video_links?.length
        ? lecture.video_links
        : [{ title: '', url: '' }],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteDoc(doc(db, 'lectures', id));
        fetchLectures();
      } catch (error) {
        console.error('Error deleting lecture:', error);
        alert('Error deleting lecture. Please try again.');
      }
    }
  };

  const addVideoLink = () => {
    setFormData({
      ...formData,
      video_links: [...formData.video_links, { title: '', url: '' }],
    });
  };

  const removeVideoLink = (index) => {
    const newLinks = formData.video_links.filter((_, i) => i !== index);
    setFormData({ ...formData, video_links: newLinks });
  };

  const updateVideoLink = (index, field, value) => {
    const newLinks = [...formData.video_links];
    newLinks[index][field] = value;
    setFormData({ ...formData, video_links: newLinks });
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
            <BookOpen size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Manage Lectures</h1>
          </div>
          <button
            onClick={() => {
              setEditingLecture(null);
              setFormData({
                topic_name: '',
                description: '',
                total_videos: 0,
                video_links: [{ title: '', url: '' }],
              });
              setShowModal(true);
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Topic
          </button>
        </div>

        {lectures.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No lectures added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 glow-on-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen size={24} className="text-primary" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(lecture)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(lecture.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{lecture.topic_name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {lecture.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Video size={16} />
                  <span>{lecture.total_videos || 0} videos</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingLecture ? 'Edit Topic' : 'Add New Topic'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingLecture(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic Name</label>
                  <input
                    type="text"
                    value={formData.topic_name}
                    onChange={(e) =>
                      setFormData({ ...formData, topic_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                    placeholder="e.g., Statistics, Machine Learning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white h-24 resize-none"
                    placeholder="Topic description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Video Lectures</label>
                  <div className="space-y-3">
                    {formData.video_links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) =>
                            updateVideoLink(index, 'title', e.target.value)
                          }
                          placeholder="Video title"
                          className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateVideoLink(index, 'url', e.target.value)}
                          placeholder="YouTube/Vimeo URL"
                          className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
                        />
                        {formData.video_links.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVideoLink(index)}
                            className="p-2 bg-red-900/20 border border-red-500 rounded-lg hover:bg-red-900/30 transition-colors"
                          >
                            <X size={18} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVideoLink}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm text-gray-300"
                    >
                      + Add Video
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
                  >
                    {editingLecture ? 'Update Topic' : 'Add Topic'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingLecture(null);
                    }}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
