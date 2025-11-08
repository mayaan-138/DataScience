import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, mockAuth } from '../../utils/auth';
import { db } from '../../firebase/config';
import ReactPlayer from 'react-player';
import { Video, CheckCircle, Circle } from 'lucide-react';

export default function VideoLectures() {
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic');
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTopic = async () => {
      if (topicId) {
        try {
          // Add timeout to prevent hanging (1 second max)
          const docRef = doc(db, 'lectures', topicId);
          const docSnap = await Promise.race([
            getDoc(docRef),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 1000)
            )
          ]);
          if (docSnap.exists()) {
            setTopic(docSnap.data());
            if (docSnap.data().video_links && docSnap.data().video_links.length > 0) {
              setSelectedVideo(docSnap.data().video_links[0]);
            }
          }
        } catch (error) {
          // Firestore is optional - show empty state
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  useEffect(() => {
    const fetchCompletedVideos = async () => {
      if (user && topicId) {
        try {
          // Add timeout to prevent hanging (1 second max)
          const studentRef = doc(db, 'students', user.uid);
          const studentSnap = await Promise.race([
            getDoc(studentRef),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 1000)
            )
          ]);
          if (studentSnap.exists()) {
            const data = studentSnap.data();
            const topicCompleted = data.completed_videos_by_topic?.[topicId] || [];
            setCompletedVideos(topicCompleted);
          }
        } catch (error) {
          // Firestore is optional - continue without completed videos data
        }
      }
    };

    fetchCompletedVideos();
  }, [user, topicId]);

  const markVideoComplete = async (videoIndex) => {
    if (!user || !topicId) return;

    try {
      const studentRef = doc(db, 'students', user.uid);
      const studentSnap = await getDoc(studentRef);
      const studentData = studentSnap.data();

      const completedByTopic = studentData.completed_videos_by_topic || {};
      const topicCompleted = completedByTopic[topicId] || [];

      if (!topicCompleted.includes(videoIndex)) {
        const updatedCompleted = [...topicCompleted, videoIndex];
        const updatedCompletedByTopic = {
          ...completedByTopic,
          [topicId]: updatedCompleted,
        };

        try {
          await Promise.race([
            updateDoc(studentRef, {
              completed_videos: (studentData.completed_videos || 0) + 1,
              xp_points: (studentData.xp_points || 0) + 50,
              completed_videos_by_topic: updatedCompletedByTopic,
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )
          ]);
        } catch (dbError) {
          // Firestore is optional - update local state anyway
          // Don't log errors to avoid console clutter
        }

        setCompletedVideos(updatedCompleted);
      }
    } catch (error) {
      // Suppress Firestore errors
    }
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!topicId || !topic) {
    return (
      <div className="p-8 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Video Lectures</h1>
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <Video size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Please select a topic to view lectures</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{topic.topic_name}</h1>
        <p className="text-gray-400 mb-8">{topic.description}</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-4">
              {selectedVideo ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <ReactPlayer
                    url={selectedVideo.url}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    onEnded={() => {
                      const videoIndex = topic.video_links.findIndex(
                        (v) => v.url === selectedVideo.url
                      );
                      if (videoIndex !== -1) {
                        markVideoComplete(videoIndex);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            {selectedVideo && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h2>
              </div>
            )}
          </div>

          {/* Video List */}
          <div className="w-full lg:w-80">
            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-bold text-white">
                  {completedVideos.length} / {topic.video_links?.length || 0} videos completed
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {topic.video_links?.map((video, index) => {
                  const isCompleted = completedVideos.includes(index);
                  const isSelected = selectedVideo?.url === video.url;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full p-4 text-left border-b border-gray-800 transition-all ${
                        isSelected
                          ? 'bg-primary/20 border-primary'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                        ) : (
                          <Circle size={20} className="text-gray-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{video.title}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
