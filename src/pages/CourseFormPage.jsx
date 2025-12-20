import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, BookOpen, Image as ImageIcon, DollarSign } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { categoryService } from '../services/categoryService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageLoader } from '../components/ui/Spinner';

export const CourseFormPage = () => {
  const { id } = useParams(); // If id exists, we're editing
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    previewVideo: '',
    price: 0,
    isFree: false,
    level: 'beginner',
    language: 'English',
    category: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchCourse();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await instructorService.getMyCourses();
      const course = response.data.find(c => c._id === id);
      
      if (course) {
        setFormData({
          title: course.title || '',
          description: course.description || '',
          thumbnail: course.thumbnail || '',
          previewVideo: course.previewVideo || '',
          price: course.price || 0,
          isFree: course.isFree || false,
          level: course.level || 'beginner',
          language: course.language || 'English',
          category: course.category?._id || '',
        });
      }
    } catch (error) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API
      const courseData = {
        ...formData,
        price: formData.isFree ? 0 : formData.price,
      };

      // Remove category if it's empty (backend expects ObjectId or undefined, not empty string)
      if (!courseData.category) {
        delete courseData.category;
      }

      if (isEditMode) {
        await instructorService.updateCourse(id, courseData);
        setSuccess('Course updated successfully!');
        setTimeout(() => navigate('/instructor/dashboard'), 1500);
      } else {
        const response = await instructorService.createCourse(courseData);
        setSuccess('Course created successfully!');
        const newCourseId = response.data._id;
        setTimeout(() => navigate(`/instructor/courses/${newCourseId}/edit`), 1500);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} course`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <BookOpen className="w-8 h-8 text-purple-400" />
             </div>
             <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {isEditMode ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-gray-400">
                    {isEditMode ? 'Update your course details' : 'Fill in the details to create your course'}
                </p>
             </div>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-blue-400" />
               <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Input
                  label="Course Title *"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Complete Web Development Bootcamp"
                  required
                  className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                  labelClassName="text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="" className="text-gray-500">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="text-black">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Input
                  label="Language"
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="e.g., English, Hindi, Spanish"
                  className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                  labelClassName="text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-pink-400" />
               <h2 className="text-lg font-semibold text-white">Media</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Input
                  label="Thumbnail URL"
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  labelClassName="text-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  Recommended: 1280x720px (16:9 aspect ratio)
                </p>
              </div>

              <div>
                <Input
                  label="Preview Video URL"
                  type="url"
                  name="previewVideo"
                  value={formData.previewVideo}
                  onChange={handleChange}
                  placeholder="https://youtube.com/embed/..."
                  className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  labelClassName="text-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  Add a promotional video for your course
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
             <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
               <DollarSign className="w-5 h-5 text-green-400" />
               <h2 className="text-lg font-semibold text-white">Pricing</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-500 rounded focus:ring-green-500 bg-black/50"
                />
                <label htmlFor="isFree" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                  This is a free course
                </label>
              </div>

              {!formData.isFree && (
                <div>
                  <Input
                    label="Price (₹) *"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="999"
                    min="0"
                    step="1"
                    required={!formData.isFree}
                    className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-green-500 font-mono text-lg"
                    labelClassName="text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    Set the price for your course in Indian Rupees
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/instructor/dashboard')}
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEditMode ? 'Update Course' : 'Create Course'}
                </>
              )}
            </Button>
          </div>
        </form>

        {isEditMode && (
          <div className="mt-8 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
             <div className="p-2 bg-blue-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
             </div>
            <p className="text-blue-200 text-sm leading-relaxed mt-1">
              <strong>Next step:</strong> Add sections and lectures to your course to make it complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
