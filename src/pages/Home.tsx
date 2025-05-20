import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSearch, FaUsers, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaKey, FaUser, FaPlus } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  username: string;
  career: string;
  account_type: string;
  subjects: string[];
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  creator_id: string;
  max_participants: number;
  creator?: User;
  member_count?: number;
}

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'students' | 'professors' | 'groups' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [groupResults, setGroupResults] = useState<StudyGroup[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    username: '',
    career: '',
    subjects: [] as string[]
  });
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    max_participants: 10
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          if (userError.message.includes('JSON object requested, multiple (or no) rows returned')) {
            navigate('/');
            return;
          }
          throw userError;
        }

        if (!userData) {
          navigate('/');
          return;
        }

        setCurrentUser(userData);
        setUserForm({
          full_name: userData.full_name,
          username: userData.username,
          career: userData.career,
          subjects: userData.subjects || []
        });
      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchType) {
      setError('Por favor selecciona una categoría de búsqueda');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      if (searchType === 'groups') {
        let query = supabase
          .from('study_groups')
          .select(`
            *,
            creator:creator_id(full_name, username),
            member_count:group_members(count)
          `);

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error: searchError } = await query;

        if (searchError) throw searchError;
        setGroupResults(data || []);
        setSearchResults([]);
      } else {
        const { data, error: searchError } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id)
          .eq('account_type', searchType === 'professors' ? 'professor' : 'student')
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,subjects.cs.{${searchQuery}}`);

        if (searchError) throw searchError;
        setSearchResults(data || []);
        setGroupResults([]);
      }
      
      setError(null);
    } catch (error: any) {
      setError('Error al buscar: ' + error.message);
    }
  };

  // Rest of the component implementation remains the same...
  // Including all the other handlers, JSX, etc.
}

export default Home;