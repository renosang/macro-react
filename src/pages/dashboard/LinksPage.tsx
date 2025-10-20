import React, { useState, useEffect, useMemo } from 'react';
import { Link as LinkType } from '../../types';
import useAuthStore from '../../stores/useAuthStore';
import HighlightText from '../components/HighlightText'; // Import component HighlightText
import { HiOutlineSearch } from 'react-icons/hi'; // Import icon kính lúp
import './LinksPage.css';

const IconSearch = HiOutlineSearch as React.ElementType;

function LinksPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuthStore();
  const teams = ['All', 'A', 'B', 'C', 'D'];

  useEffect(() => {
    const fetchLinks = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/links', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLinks(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLinks();
  }, [token]);

  const filteredLinks = useMemo(() => {
    let tempLinks = links;

    if (selectedTeam !== 'All') {
      tempLinks = tempLinks.filter(link => link.team === selectedTeam);
    }

    if (searchQuery) {
      tempLinks = tempLinks.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempLinks;
  }, [selectedTeam, searchQuery, links]);

  return (
    <div className="links-page-container">
      <h1>Liên kết tổng hợp</h1>
      <div className="links-filter-container">
        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
          {teams.map(team => (
            <option key={team} value={team}>
              {team === 'All' ? 'Tất cả Team' : `Team ${team}`}
            </option>
          ))}
        </select>
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <IconSearch className="search-icon" />
        </div>
      </div>
      <div className="links-list">
        {filteredLinks.map(link => (
          <a key={link._id} href={link.url} target="_blank" rel="noopener noreferrer" className="link-card-anchor">
            <div className="link-card">
              <span className="link-team-badge">Team {link.team}</span>
              <h3>
                <HighlightText text={link.title} highlight={searchQuery} />
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default LinksPage;