import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, MoreVertical, DollarSign, FileText } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';

export const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await instructorService.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    setActionLoading(courseId);
    try {
      await instructorService.togglePublish(courseId);
      // Update local state
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { ...course, published: !currentStatus }
          : course
      ));
    } catch (error) {
      setError('Failed to update course status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setActionLoading(courseId);
    try {
      await instructorService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      setError('Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageLoader />;

  const publishedCount = courses.filter(c => c.published).length;
  const draftCount = courses.filter(c => !c.published).length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-12">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Instructor Dashboard</h1>
              <p className="text-gray-400">Manage your courses, track performance, and create new content</p>
            </div>
            <Link to="/instructor/courses/create">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-white">{courses.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
              </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                    <Eye className="w-6 h-6 text-green-400" />
                </div>
              </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-400">{draftCount}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
          </div>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BookOpen className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No courses yet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start creating courses and share your knowledge with students to earn revenue and build your reputation.
              </p>
              <Link to="/instructor/courses/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-purple-500/20">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Courses</h2>
            {courses.map((course) => (
              <div key={course._id} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-64 h-40 flex-shrink-0 overflow-hidden rounded-xl">
                         <img
                            src={course.thumbnail || 'https://via.placeholder.com/200x120'}
                            alt={course.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">
                            {course.title}
                          </h3>
                          {course.published ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Published</Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Draft</Badge>
                          )}
                          {course.level && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                              {COURSE_LEVELS[course.level]}
                            </Badge>
                          )}
                        </div>
                        
                        {course.description && (
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 max-w-3xl">
                                {course.description}
                            </p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-white">{course.isFree ? 'Free' : formatCurrency(course.price)}</span>
                            </div>
                            {course.category && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    <span>{course.category.name}</span>
                                </div>
                            )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10">
                          <Link to={`/instructor/courses/${course._id}/edit`}>
                            <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Course
                            </Button>
                          </Link>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(course._id, course.published)}
                            disabled={actionLoading === course._id}
                            className={`${course.published ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                          >
                            {course.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publish Now
                              </>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course._id)}
                            disabled={actionLoading === course._id}
                            className="text-red-400 hover:bg-red-500/10 ml-auto"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                      </div>
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
