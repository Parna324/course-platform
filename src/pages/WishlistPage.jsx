import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistService } from '../services/wishlistService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await wishlistService.removeFromWishlist(courseId);
      setWishlist({
        ...wishlist,
        courses: wishlist.courses.filter(course => course._id !== courseId)
      });
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      setError('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <PageLoader />;

  const courses = wishlist?.courses || [];

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-12">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-400 mb-2">My Wishlist</h1>
          <p className="text-gray-400">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} saved for later
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Wishlist Content */}
        {courses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Your wishlist is empty
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Save courses you're interested in for later. Explore our catalog to find your next skill to master.
              </p>
              <Link to="/courses">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-purple-500/20">
                  Browse Courses
                </Button>
              </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course._id} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Course Image */}
                    <Link 
                      to={`/courses/${course._id}`}
                      className="flex-shrink-0 relative overflow-hidden rounded-xl w-full md:w-64 h-40"
                    >
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Course Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          {course.level && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                              {COURSE_LEVELS[course.level]}
                            </Badge>
                          )}
                          {course.isFree && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Free</Badge>
                          )}
                        </div>

                        <Link to={`/courses/${course._id}`}>
                          <h3 className="text-xl font-bold text-gray-100 mb-2 hover:text-purple-400 transition-colors">
                            {course.title}
                          </h3>
                        </Link>

                        {course.description && (
                          <p className="text-gray-400 mb-3 line-clamp-2 text-sm">
                            {course.description}
                          </p>
                        )}

                        {course.instructor && (
                          <p className="text-sm text-gray-500 mb-4">
                            By {course.instructor.name}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-auto">
                        <Link to={`/courses/${course._id}`}>
                          <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-none">
                            View Details
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemove(course._id)}
                          disabled={removing === course._id}
                          className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {removing === course._id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end justify-start md:justify-center">
                      <div className="text-2xl font-bold text-white mb-2">
                        {course.isFree ? 'Free' : formatCurrency(course.price)}
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
