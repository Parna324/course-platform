import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock, PlayCircle } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';

export const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [filter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await enrollmentService.getMyEnrollments(status);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-12">
       {/* Background Effects */}
       <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-purple-900/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-blue-900/20 rounded-full blur-[100px]" />
       </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">My Learning</h1>
          <p className="text-gray-400 text-lg">Continue your learning journey and master new skills</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'ongoing', 'completed'].map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm whitespace-nowrap ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' && 'Courses'}
              </button>
          ))}
        </div>

        {/* Enrollments Grid */}
        {enrollments.length === 0 ? (
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No courses yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Explore our catalog to start learning.
            </p>
            <Link to="/courses">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-purple-500/20">
                  Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm shadow-xl flex flex-col h-full">
                <Link to={`/courses/${enrollment.course._id}/learn`} className="relative block overflow-hidden aspect-video">
                  <img
                    src={enrollment.course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </Link>
                
                <div className="p-6 flex flex-col flex-grow">
                  <Link to={`/courses/${enrollment.course._id}/learn`}>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {enrollment.course.title}
                    </h3>
                  </Link>
                  
                  {enrollment.course.instructor && (
                    <p className="text-sm text-gray-400 mb-6">
                      By {enrollment.course.instructor.name}
                    </p>
                  )}

                  <div className="mt-auto space-y-4">
                      {enrollment.progress && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>{Math.round(enrollment.progress.progressPercentage)}% Complete</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${enrollment.progress.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Link to={`/courses/${enrollment.course._id}/learn`} className="block">
                        <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold shadow-lg shadow-white/5">
                          Continue Learning
                        </Button>
                      </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
