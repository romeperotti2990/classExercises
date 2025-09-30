/*// Constants and initialization
const GENERATIONS = {
    1: { start: 1, end: 151, name: "Kanto" }, 2: { start: 152, end: 251, name: "Johto" },
    3: { start: 252, end: 386, name: "Hoenn" }, 4: { start: 387, end: 493, name: "Sinnoh" },
    5: { start: 494, end: 649, name: "Unova" }, 6: { start: 650, end: 721, name: "Kalos" },
    7: { start: 722, end: 809, name: "Alola" }, 8: { start: 810, end: 905, name: "Galar" }
};

const TYPE_COLORS = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

let allPokemonNames = [];
let activeTypeFilters = new Set();

// Utility functions
const createElement = (tag, styles = {}, content = '') => {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    if (content) el.innerHTML = content;
    return el;
};

const createButton = (text, bgColor, onClick) => {
    const btn = createElement('button', {
        padding: '10px 15px', backgroundColor: bgColor, color: 'white',
        border: 'none', borderRadius: '4px', cursor: 'pointer'
    }, text);
    btn.addEventListener('click', onClick);
    return btn;
};

// Initialize
document.body.appendChild(createButton('Show Pokemon', '#4CAF50', displayPokemon));
fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
    .then(r => r.json())
    .then(data => allPokemonNames = data.results.map(p => p.name))
    .catch(console.error);

// Input parsing
function parseUserInput(input) {
    const trimmed = input.trim().toLowerCase();
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    const genMatch = trimmed.match(/^(?:gen(?:eration)?\s*)?(\d+)$/);
    const num = parseInt(trimmed);
    
    if (rangeMatch) return { type: 'range', start: +rangeMatch[1], end: +rangeMatch[2] };
    if (genMatch && GENERATIONS[+genMatch[1]]) return { type: 'generation', gen: +genMatch[1], ...GENERATIONS[+genMatch[1]] };
    if (TYPE_COLORS[trimmed]) return { type: 'pokemonType', pokemonType: trimmed };
    if (!isNaN(num) && num > 0) return { type: 'count', count: num };
    return { type: 'name', name: trimmed };
}

// Custom prompt
function createCustomPrompt() {
    return new Promise(resolve => {
        const overlay = createElement('div', {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: '1000'
        });

        const dialog = createElement('div', {
            backgroundColor: 'white', padding: '20px', borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '300px'
        });

        const input = createElement('input', {
            width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px'
        });
        input.type = 'text';
        input.placeholder = 'Enter Pokemon name, number, range (1-151), gen 1, or type';
        input.setAttribute('list', 'pokemon-list');

        const datalist = createElement('datalist');
        datalist.id = 'pokemon-list';
        allPokemonNames.forEach(name => {
            const option = createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });

        const handleSubmit = () => {
            document.body.removeChild(overlay);
            resolve(input.value.trim() || null);
        };

        const okBtn = createButton('OK', '#007cba', handleSubmit);
        const cancelBtn = createButton('Cancel', '#ccc', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        input.addEventListener('keypress', e => e.key === 'Enter' && handleSubmit());

        dialog.append(
            createElement('h3', {marginTop: '0'}, 'Enter Pokemon Query'),
            createElement('div', {marginBottom: '15px'}, `
                <small style="color: #666;">
                    Examples: <strong>pikachu</strong>, <strong>25</strong>, <strong>1-151</strong>, 
                    <strong>gen 1</strong>, <strong>fire</strong>
                </small>`),
            input, datalist,
            createElement('div', {display: 'flex', gap: '10px', justifyContent: 'flex-end'}).append(cancelBtn, okBtn) || cancelBtn.parentNode
        );

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus();
    });
}

// Pokemon display
function createPokemonCard(pokemonData, isListView = true) {
    const primaryType = pokemonData.types[0].type.name;
    const primaryColor = TYPE_COLORS[primaryType] || '#ccc';
    
    const card = createElement('div', {
        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
        border: `2px solid ${primaryColor}`, borderRadius: '10px', opacity: '0',
        transition: 'opacity 0.3s ease-in', minHeight: '120px',
        background: `linear-gradient(135deg, ${primaryColor}20, transparent)`
    });

    const img = createElement('img', { width: '100px', height: '100px', flexShrink: '0' });
    img.src = pokemonData.sprites.front_default;
    img.alt = pokemonData.name;

    const info = createElement('div', { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1' });
    
    const name = createElement('div', {}, 
        `<strong style="font-size: 20px; color: ${primaryColor};">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</strong> 
         <span style="color: #666; font-size: 16px;">(#${pokemonData.id})</span>`);

    const types = createElement('div', { display: 'flex', gap: '5px', alignItems: 'center' });
    types.appendChild(createElement('span', { fontWeight: 'bold', fontSize: '14px' }, 'Type: '));
    pokemonData.types.forEach(typeInfo => {
        const badge = createElement('span', {
            backgroundColor: TYPE_COLORS[typeInfo.type.name] || '#999', color: 'white',
            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
        }, typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1));
        badge.className = 'pokemon-type';
        badge.dataset.type = typeInfo.type.name;
        types.appendChild(badge);
    });

    const stats = createElement('div', { display: 'flex', gap: '15px', fontSize: '14px' }, 
        `<span><strong>Weight:</strong> ${(pokemonData.weight / 10).toFixed(1)} kg</span>
         <span><strong>Height:</strong> ${(pokemonData.height / 10).toFixed(1)} m</span>
         <span><strong>Base Exp:</strong> ${pokemonData.base_experience || 'N/A'}</span>`);

    const abilities = createElement('div', { fontSize: '14px' });
    const abilitiesText = pokemonData.abilities.map(a => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)).join(', ');
    abilities.innerHTML = `<strong>Abilities:</strong> <span class="pokemon-abilities">${abilitiesText}</span>`;

    info.append(name, types, stats, abilities);
    card.append(img, info);
    
    setTimeout(() => card.style.opacity = '1', 10);
    return card;
}

// Main display function
async function displayPokemon() {
    const userInput = await createCustomPrompt();
    if (!userInput) return;
    
    const parsed = parseUserInput(userInput);
    
    try {
        if (parsed.type === 'name') {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${parsed.name}`);
            if (!response.ok) throw new Error("Pokemon not found");
            const pokemonData = await response.json();
            
            document.body.innerHTML = '';
            document.body.appendChild(createButton('Show Pokemon', '#4CAF50', displayPokemon));
            
            const container = createElement('div', { 
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' 
            });
            container.appendChild(createPokemonCard(pokemonData, false));
            document.body.appendChild(container);
            return;
        }

        let pokemonList = [];
        let title = '';
        
        switch (parsed.type) {
            case 'count':
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${parsed.count}`);
                pokemonList = (await response.json()).results;
                title = `First ${parsed.count} Pokemon`;
                break;
            case 'range':
            case 'generation':
                pokemonList = Array.from({length: parsed.end - parsed.start + 1}, (_, i) => ({
                    name: `pokemon-${parsed.start + i}`,
                    url: `https://pokeapi.co/api/v2/pokemon/${parsed.start + i}/`
                }));
                title = parsed.type === 'generation' ? 
                    `Generation ${parsed.gen} - ${parsed.name} Region` : 
                    `Pokemon #${parsed.start} - #${parsed.end}`;
                break;
            case 'pokemonType':
                const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${parsed.pokemonType}`);
                const typeData = await typeResponse.json();
                pokemonList = typeData.pokemon.map(p => ({ name: p.pokemon.name, url: p.pokemon.url }));
                title = `${parsed.pokemonType.charAt(0).toUpperCase() + parsed.pokemonType.slice(1)} Type Pokemon`;
                break;
        }

        await displayPokemonList(pokemonList, title);
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to fetch Pokemon data. Please try again.');
    }
}

async function displayPokemonList(pokemonList, title) {
    document.body.innerHTML = '';
    
    const titleEl = createElement('h2', { textAlign: 'center', margin: '20px 0' }, title);
    const loading = createElement('div', { 
        textAlign: 'center', fontStyle: 'italic', color: '#666' 
    }, `Loading ${pokemonList.length} Pokemon...`);
    const container = createElement('div', { display: 'flex', flexDirection: 'column', gap: '10px' });
    
    document.body.append(titleEl, loading, container);

    let loadedCount = 0;
    for (const pokemon of pokemonList) {
        try {
            const response = await fetch(pokemon.url);
            const pokemonData = await response.json();
            container.appendChild(createPokemonCard(pokemonData));
            loading.textContent = `Loading Pokemon... (${++loadedCount}/${pokemonList.length})`;
        } catch (error) {
            console.error(`Error fetching ${pokemon.name}:`, error);
            loadedCount++;
        }
    }

    setTimeout(() => {
        loading.remove();
        addSearchFunctionality(container);
    }, 2000);
}

function addSearchFunctionality(container) {
    const searchContainer = createElement('div', { 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        margin: '20px 0', gap: '15px' 
    });

    const inputContainer = createElement('div', { display: 'flex', gap: '10px', alignItems: 'center' });
    const searchInput = createElement('input', { 
        padding: '10px', fontSize: '16px', width: '300px', 
        borderRadius: '4px', border: '1px solid #ccc' 
    });
    searchInput.placeholder = 'Search by name, type, or ability...';

    inputContainer.append(
        searchInput,
        createButton('Clear', '#f44336', () => {
            searchInput.value = '';
            activeTypeFilters.clear();
            updateFilters();
        }),
        createButton('New Search', '#4CAF50', displayPokemon)
    );

    const typeContainer = createElement('div', { 
        display: 'flex', flexWrap: 'wrap', gap: '5px', 
        justifyContent: 'center', maxWidth: '600px' 
    });
    
    const allTypesBtn = createButton('All Types', '#333', () => {
        activeTypeFilters.clear();
        updateFilters();
    });
    allTypesBtn.classList.add('active-filter');
    typeContainer.appendChild(allTypesBtn);

    Object.keys(TYPE_COLORS).forEach(type => {
        const btn = createButton(type.charAt(0).toUpperCase() + type.slice(1), TYPE_COLORS[type], null);
        btn.style.fontSize = '12px';
        btn.style.padding = '5px 10px';
        btn.style.borderRadius = '15px';
        btn.dataset.type = type;
        typeContainer.appendChild(btn);
    });

    const resultCount = createElement('div', { 
        textAlign: 'center', fontSize: '16px', color: '#333', fontWeight: 'bold' 
    });

    searchContainer.append(
        inputContainer,
        createElement('div', { fontSize: '12px', color: '#666', fontStyle: 'italic' }, 'Hold Shift to select multiple types'),
        typeContainer,
        resultCount
    );

    const updateFilters = () => {
        const query = searchInput.value.toLowerCase();
        let visible = 0;

        Array.from(container.children).forEach(item => {
            const name = item.querySelector('div > div:first-child').textContent.toLowerCase();
            const types = Array.from(item.querySelectorAll('.pokemon-type')).map(el => el.dataset.type);
            const abilities = item.querySelector('.pokemon-abilities').textContent.toLowerCase();

            const matchesSearch = !query || name.includes(query) || types.some(t => t.includes(query)) || abilities.includes(query);
            const matchesType = !activeTypeFilters.size || types.some(t => activeTypeFilters.has(t));

            if (matchesSearch && matchesType) {
                item.style.display = 'flex';
                visible++;
            } else {
                item.style.display = 'none';
            }
        });

        resultCount.textContent = query || activeTypeFilters.size ? 
            `${visible} of ${container.children.length} Pokemon shown` : 
            `${container.children.length} Pokemon`;

        // Update button styles
        typeContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active-filter', 
                !btn.dataset.type ? !activeTypeFilters.size : activeTypeFilters.has(btn.dataset.type));
        });
    };

    searchInput.addEventListener('input', updateFilters);
    
    typeContainer.addEventListener('click', e => {
        if (!e.target.dataset.type) return;
        const type = e.target.dataset.type;
        
        if (e.shiftKey) {
            activeTypeFilters.has(type) ? activeTypeFilters.delete(type) : activeTypeFilters.add(type);
        } else {
            activeTypeFilters.clear();
            activeTypeFilters.add(type);
        }
        updateFilters();
    });

    document.body.insertBefore(searchContainer, container);
    updateFilters();

    // Add CSS
    document.head.appendChild(createElement('style', {}, `
        .active-filter {
            box-shadow: 0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px #333 !important;
            transform: scale(1.05);
        }
    `));
}*/