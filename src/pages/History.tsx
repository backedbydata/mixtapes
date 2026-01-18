import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Calendar, Music, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Modal } from '../components/ui';
import { Layout } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mixtape, Playlist } from '../lib/supabase';

interface MixtapeWithPlaylist extends Mixtape {
  playlists: Playlist[];
}

export function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mixtapes, setMixtapes] = useState<MixtapeWithPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mixtapeToDelete, setMixtapeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchMixtapes();
  }, [user, navigate]);

  const fetchMixtapes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mixtapes')
      .select(`
        *,
        playlists (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mixtapes:', error);
    } else {
      setMixtapes(data || []);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!mixtapeToDelete) return;

    setDeleting(true);

    const { error } = await supabase
      .from('mixtapes')
      .delete()
      .eq('id', mixtapeToDelete);

    if (!error) {
      setMixtapes((prev) => prev.filter((m) => m.id !== mixtapeToDelete));
    }

    setDeleting(false);
    setDeleteModalOpen(false);
    setMixtapeToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">
              My Mixtapes
            </h1>
            <p className="text-neutral-600">
              Your digitized mixtape collection
            </p>
          </div>
          <Button onClick={() => navigate('/scan')} icon={<Plus className="w-4 h-4" />}>
            Scan New
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-neutral-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-1" />
                    <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : mixtapes.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <Music className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No mixtapes yet
            </h3>
            <p className="text-neutral-600 mb-8 max-w-sm mx-auto">
              Start by scanning your first handwritten song list to create a digital playlist.
            </p>
            <Button onClick={() => navigate('/scan')} icon={<Plus className="w-4 h-4" />}>
              Scan Your First Mixtape
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mixtapes.map((mixtape) => (
              <Card key={mixtape.id} hover>
                <div className="flex items-start gap-4">
                  {mixtape.original_image_url ? (
                    <img
                      src={mixtape.original_image_url}
                      alt={mixtape.name}
                      className="w-20 h-20 object-cover rounded-lg bg-neutral-100"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {mixtape.name || 'Untitled Mixtape'}
                    </h3>

                    {mixtape.description && (
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                        {mixtape.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(mixtape.created_at)}
                      </span>

                      {mixtape.playlists.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Music className="w-4 h-4" />
                          {mixtape.playlists.length} playlist{mixtape.playlists.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {mixtape.playlists.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {mixtape.playlists.map((playlist) => (
                          <a
                            key={playlist.id}
                            href={playlist.external_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs font-medium hover:bg-[#1DB954]/20 transition-colors"
                          >
                            <Music className="w-3 h-3" />
                            {playlist.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setMixtapeToDelete(mixtape.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-neutral-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                    title="Delete mixtape"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMixtapeToDelete(null);
        }}
        title="Delete Mixtape"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete this mixtape? This action cannot be undone.
            Note: This will not delete any playlists created in Spotify.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setMixtapeToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
