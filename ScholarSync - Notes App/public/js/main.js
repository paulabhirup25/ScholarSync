// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notes-container');
    const searchInput = document.getElementById('search-input');
    const subjectFilter = document.getElementById('subject-filter');
    const classFilter = document.getElementById('class-filter');
    const resultCount = document.getElementById('result-count');

    // Initial Render
    renderNotes(notesData);

    // Event Listeners
    searchInput.addEventListener('input', handleFilter);
    subjectFilter.addEventListener('change', handleFilter);
    classFilter.addEventListener('change', handleFilter);

    function handleFilter() {
        const query = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const selectedClass = classFilter.value;

        const filtered = notesData.filter(note => {
            // SEARCH LOGIC: Checks Title OR Chapter OR Description
            const matchesSearch = 
                note.title.toLowerCase().includes(query) || 
                note.chapter.toLowerCase().includes(query) ||
                note.description.toLowerCase().includes(query);
            
            // FILTER LOGIC: Checks Subject and Class
            const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
            const matchesClass = selectedClass === 'All' || note.classLevel === selectedClass;

            return matchesSearch && matchesSubject && matchesClass;
        });

        renderNotes(filtered);
    }

    function renderNotes(notes) {
        container.innerHTML = ''; // Clear current notes
        resultCount.innerText = `Showing ${notes.length} notes`;

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400 text-lg">No notes found matching your criteria.</p>
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            // 1. Determine Badge Color
            let badgeColor = 'bg-gray-100 text-gray-800';
            if(note.subject === 'Physics') badgeColor = 'bg-blue-100 text-blue-800';
            if(note.subject === 'Chemistry') badgeColor = 'bg-purple-100 text-purple-800';
            if(note.subject === 'Math') badgeColor = 'bg-red-100 text-red-800';
            if(note.subject === 'Biology') badgeColor = 'bg-green-100 text-green-800';

            // 2. Determine Button Type (View PDF or Coming Soon) with Dark Mode Classes
            let buttonHTML;
            if (note.link === '#' || note.link === '') {
                // COMING SOON BUTTON (Adapts to Dark Mode)
                buttonHTML = `
                    <button onclick="alert('Coming Soon! This note is currently being prepared.')" 
                       class="block w-full text-center bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed transition-colors">
                       Coming Soon
                    </button>
                `;
            } else {
                // NORMAL VIEW PDF BUTTON (Adapts to Dark Mode)
                buttonHTML = `
                    <a href="${note.link}" target="_blank" rel="noopener noreferrer" 
                       class="block w-full text-center bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                       View PDF
                    </a>
                `;
            }

            const card = document.createElement('div');
            // DARK MODE CLASSES ADDED: dark:bg-slate-800 dark:border-slate-700
            card.className = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 flex flex-col h-full';
            
            card.innerHTML = `
                <div class="p-6 flex-grow">
                    <div class="flex justify-between items-start mb-4">
                        <span class="${badgeColor} text-xs font-semibold px-2.5 py-0.5 rounded">
                            ${note.subject}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Class ${note.classLevel}</span>
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">${note.title}</h3>
                    
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">${note.chapter}</p>
                    
                    <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                        ${note.description || 'No description available.'}
                    </p>
                </div>
                <div class="px-6 pb-6 pt-0 mt-auto">
                    ${buttonHTML}
                    <div class="text-center mt-3 text-xs text-gray-400 dark:text-gray-500">
                        Added: ${note.date}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
});