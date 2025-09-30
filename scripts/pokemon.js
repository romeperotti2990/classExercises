const showPokemonButton = document.createElement("button");
showPokemonButton.id = "show-pokemon";
showPokemonButton.textContent = "Show Pokemon";
document.body.appendChild(showPokemonButton);

// Store Pokemon names for autocomplete
let allPokemonNames = [];

showPokemonButton.addEventListener("click", displayPokemon);

// Function to load all Pokemon names for autocomplete
async function loadAllPokemonNames() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        allPokemonNames = data.results.map(pokemon => pokemon.name);
    } catch (error) {
        console.error('Error loading Pokemon names:', error);
    }
}

// Load Pokemon names when page loads
loadAllPokemonNames();

// Add generation ranges
const generations = {
    1: { start: 1, end: 151, name: "Kanto" },
    2: { start: 152, end: 251, name: "Johto" },
    3: { start: 252, end: 386, name: "Hoenn" },
    4: { start: 387, end: 493, name: "Sinnoh" },
    5: { start: 494, end: 649, name: "Unova" },
    6: { start: 650, end: 721, name: "Kalos" },
    7: { start: 722, end: 809, name: "Alola" },
    8: { start: 810, end: 905, name: "Galar" }
};

// Add type colors for visual appeal
const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

function parseUserInput(input) {
    const trimmed = input.trim().toLowerCase();
    
    // Check for range (e.g., "1-151", "300-330")
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        return { type: 'range', start, end };
    }
    
    // Check for generation (e.g., "gen 1", "generation 1", "gen1")
    const genMatch = trimmed.match(/^(?:gen(?:eration)?\s*)?(\d+)$/);
    if (genMatch) {
        const genNum = parseInt(genMatch[1]);
        if (generations[genNum]) {
            return { 
                type: 'generation', 
                gen: genNum,
                start: generations[genNum].start,
                end: generations[genNum].end,
                name: generations[genNum].name
            };
        }
    }
    
    // Check for Pokemon type
    if (Object.keys(typeColors).includes(trimmed)) {
        return { type: 'pokemonType', pokemonType: trimmed };
    }
    
    // Check if it's a number
    const num = parseInt(trimmed);
    if (!isNaN(num) && num > 0) {
        return { type: 'count', count: num };
    }
    
    // Otherwise treat as Pokemon name
    return { type: 'name', name: trimmed };
}

async function fetchPokemonByType(pokemonType) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType}`);
        if (!response.ok) throw new Error("Type not found");
        const data = await response.json();
        return data.pokemon.map(p => ({
            name: p.pokemon.name,
            url: p.pokemon.url
        }));
    } catch (error) {
        throw new Error(`Failed to fetch ${pokemonType} type Pokemon`);
    }
}

async function fetchPokemonByRange(start, end) {
    const pokemon = [];
    for (let i = start; i <= end; i++) {
        pokemon.push({
            name: `pokemon-${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i}/`
        });
    }
    return pokemon;
}

function createCustomPrompt() {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';

        // Create dialog box
        const dialog = document.createElement('div');
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '10px';
        dialog.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        dialog.style.minWidth = '300px';

        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Enter Pokemon Query';
        title.style.marginTop = '0';

        // Add examples
        const examples = document.createElement('div');
        examples.innerHTML = `
            <small style="color: #666;">
                Examples:<br>
                • <strong>pikachu</strong> - Single Pokemon<br>
                • <strong>25</strong> - First 25 Pokemon<br>
                • <strong>1-151</strong> or <strong>300-330</strong> - Range<br>
                • <strong>gen 1</strong> or <strong>generation 3</strong> - By generation<br>
                • <strong>fire</strong> or <strong>water</strong> - By type
            </small>
        `;
        examples.style.marginBottom = '15px';

        // Create input with datalist
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter number or Pokemon name...';
        input.style.width = '100%';
        input.style.padding = '10px';
        input.style.marginBottom = '10px';
        input.style.fontSize = '16px';
        input.setAttribute('list', 'pokemon-list');

        const datalist = document.createElement('datalist');
        datalist.id = 'pokemon-list';

        // Add all Pokemon names to datalist
        allPokemonNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });

        // Create buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'flex-end';

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.padding = '8px 16px';
        okButton.style.backgroundColor = '#007cba';
        okButton.style.color = 'white';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '4px';
        okButton.style.cursor = 'pointer';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.backgroundColor = '#ccc';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';

        // Event listeners
        okButton.addEventListener('click', () => {
            const value = input.value.trim();
            document.body.removeChild(overlay);
            resolve(value || null);
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                document.body.removeChild(overlay);
                resolve(value || null);
            }
        });

        // Assemble dialog
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(okButton);
        dialog.appendChild(title);
        dialog.appendChild(examples);
        dialog.appendChild(input);
        dialog.appendChild(datalist);
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Focus input
        input.focus();
    });
}

async function displayPokemon() {
    const userInput = await createCustomPrompt();
    
    if (!userInput) {
        return; // User cancelled
    }
    
    const parsed = parseUserInput(userInput);
    
    try {
        let pokemonList = [];
        let displayTitle = "";
        
        switch (parsed.type) {
            case 'name':
                // Handle single Pokemon name
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${parsed.name}`);
                    if (!response.ok) throw new Error("Pokemon not found");
                    const pokemonData = await response.json();
                    await displaySinglePokemon(pokemonData);
                    return;
                } catch (error) {
                    alert("Pokemon not found. Please enter a valid name.");
                    return;
                }
                
            case 'count':
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${parsed.count}`);
                const data = await response.json();
                pokemonList = data.results;
                displayTitle = `First ${parsed.count} Pokemon`;
                break;
                
            case 'range':
                pokemonList = await fetchPokemonByRange(parsed.start, parsed.end);
                displayTitle = `Pokemon #${parsed.start} - #${parsed.end}`;
                break;
                
            case 'generation':
                pokemonList = await fetchPokemonByRange(parsed.start, parsed.end);
                displayTitle = `Generation ${parsed.gen} - ${parsed.name} Region`;
                break;
                
            case 'pokemonType':
                pokemonList = await fetchPokemonByType(parsed.pokemonType);
                displayTitle = `${parsed.pokemonType.charAt(0).toUpperCase() + parsed.pokemonType.slice(1)} Type Pokemon`;
                break;
                
            default:
                alert("Invalid input format");
                return;
        }
        
        await displayPokemonList(pokemonList, displayTitle, parsed.pokemonType);
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to fetch Pokemon data. Please try again.');
    }
}

async function displaySinglePokemon(pokemonData) {
    // Clear body and show single Pokemon
    document.body.innerHTML = '';
    
    // Re-add button first
    const newButton = document.createElement("button");
    newButton.id = "show-pokemon";
    newButton.textContent = "Show Pokemon";
    newButton.addEventListener("click", displayPokemon);
    document.body.appendChild(newButton);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    // Get primary type for theming
    const primaryType = pokemonData.types[0].type.name;
    const primaryColor = typeColors[primaryType] || '#ccc';

    const pokemonItem = document.createElement('div');
    pokemonItem.style.display = 'flex';
    pokemonItem.style.alignItems = 'center';
    pokemonItem.style.gap = '20px';
    pokemonItem.style.padding = '20px';
    pokemonItem.style.border = `3px solid ${primaryColor}`;
    pokemonItem.style.borderRadius = '15px';
    pokemonItem.style.background = `linear-gradient(135deg, ${primaryColor}20, transparent)`;
    pokemonItem.style.maxWidth = '600px';

    const img = document.createElement('img');
    img.src = pokemonData.sprites.front_default;
    img.alt = pokemonData.name;
    img.style.width = '150px';
    img.style.height = '150px';

    // Create detailed info container (reuse the same structure as list view)
    const infoContainer = document.createElement('div');
    infoContainer.style.display = 'flex';
    infoContainer.style.flexDirection = 'column';
    infoContainer.style.gap = '10px';

    // Name and ID
    const nameSpan = document.createElement('div');
    nameSpan.innerHTML = `<strong style="font-size: 24px; color: ${primaryColor};">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</strong> <span style="color: #666; font-size: 18px;">(#${pokemonData.id})</span>`;

    // Types (same as list view)
    const typesContainer = document.createElement('div');
    typesContainer.style.display = 'flex';
    typesContainer.style.gap = '5px';
    typesContainer.style.alignItems = 'center';
    
    const typeLabel = document.createElement('span');
    typeLabel.textContent = 'Type: ';
    typeLabel.style.fontWeight = 'bold';
    typesContainer.appendChild(typeLabel);

    pokemonData.types.forEach(typeInfo => {
        const typeBadge = document.createElement('span');
        typeBadge.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
        typeBadge.style.backgroundColor = typeColors[typeInfo.type.name] || '#999';
        typeBadge.style.color = 'white';
        typeBadge.style.padding = '6px 12px';
        typeBadge.style.borderRadius = '15px';
        typeBadge.style.fontSize = '14px';
        typeBadge.style.fontWeight = 'bold';
        typesContainer.appendChild(typeBadge);
    });

    // Stats
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'flex';
    statsContainer.style.flexDirection = 'column';
    statsContainer.style.gap = '5px';

    const weightHeight = document.createElement('div');
    weightHeight.innerHTML = `<strong>Weight:</strong> ${(pokemonData.weight / 10).toFixed(1)} kg | <strong>Height:</strong> ${(pokemonData.height / 10).toFixed(1)} m | <strong>Base Exp:</strong> ${pokemonData.base_experience || 'N/A'}`;

    // Abilities
    const abilitiesDiv = document.createElement('div');
    const abilitiesText = pokemonData.abilities
        .map(ability => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1))
        .join(', ');
    abilitiesDiv.innerHTML = `<strong>Abilities:</strong> ${abilitiesText}`;

    statsContainer.appendChild(weightHeight);
    statsContainer.appendChild(abilitiesDiv);

    infoContainer.appendChild(nameSpan);
    infoContainer.appendChild(typesContainer);
    infoContainer.appendChild(statsContainer);

    pokemonItem.appendChild(img);
    pokemonItem.appendChild(infoContainer);
    container.appendChild(pokemonItem);
    document.body.appendChild(container);
}

async function displayPokemonList(pokemonList, title, pokemonType = null) {
    // Clear body and set up initial layout
    document.body.innerHTML = '';

    // Re-add button at top
    const newButton = document.createElement("button");
    newButton.id = "show-pokemon";
    newButton.textContent = "Show Pokemon";
    newButton.addEventListener("click", displayPokemon);
    document.body.appendChild(newButton);

    // Add title
    const titleDiv = document.createElement('h2');
    titleDiv.textContent = title;
    titleDiv.style.textAlign = 'center';
    titleDiv.style.margin = '20px 0';
    if (pokemonType && typeColors[pokemonType]) {
        titleDiv.style.color = typeColors[pokemonType];
    }
    document.body.appendChild(titleDiv);

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = `Loading ${pokemonList.length} Pokemon...`;
    loadingDiv.style.padding = '10px';
    loadingDiv.style.fontStyle = 'italic';
    loadingDiv.style.color = '#666';
    loadingDiv.style.textAlign = 'center';
    document.body.appendChild(loadingDiv);

    // Create container for Pokemon display
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);

    let loadedCount = 0;

    // Load Pokemon one by one and display immediately
    for (const pokemon of pokemonList) {
        try {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();

            // Create Pokemon item container
            const pokemonItem = document.createElement('div');
            pokemonItem.style.display = 'flex';
            pokemonItem.style.alignItems = 'center';
            pokemonItem.style.gap = '15px';
            pokemonItem.style.padding = '15px';
            pokemonItem.style.border = '2px solid #ccc';
            pokemonItem.style.borderRadius = '10px';
            pokemonItem.style.opacity = '0';
            pokemonItem.style.transition = 'opacity 0.3s ease-in';
            pokemonItem.style.minHeight = '120px';

            // Get primary type for color theming
            const primaryType = pokemonData.types[0].type.name;
            const primaryColor = typeColors[primaryType] || '#ccc';
            
            // Set border and background based on primary type
            pokemonItem.style.borderColor = primaryColor;
            pokemonItem.style.background = `linear-gradient(135deg, ${primaryColor}20, transparent)`;

            // Create and add image
            const img = document.createElement('img');
            img.src = pokemonData.sprites.front_default;
            img.alt = pokemon.name;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.flexShrink = '0';

            // Create info container
            const infoContainer = document.createElement('div');
            infoContainer.style.display = 'flex';
            infoContainer.style.flexDirection = 'column';
            infoContainer.style.gap = '8px';
            infoContainer.style.flex = '1';

            // Create and add name with Pokemon ID
            const nameSpan = document.createElement('div');
            nameSpan.innerHTML = `<strong style="font-size: 20px; color: ${primaryColor};">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</strong> <span style="color: #666; font-size: 16px;">(#${pokemonData.id})</span>`;

            // Create types container
            const typesContainer = document.createElement('div');
            typesContainer.style.display = 'flex';
            typesContainer.style.gap = '5px';
            typesContainer.style.alignItems = 'center';
            
            const typeLabel = document.createElement('span');
            typeLabel.textContent = 'Type: ';
            typeLabel.style.fontWeight = 'bold';
            typeLabel.style.fontSize = '14px';
            typesContainer.appendChild(typeLabel);

            pokemonData.types.forEach(typeInfo => {
                const typeBadge = document.createElement('span');
                typeBadge.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
                typeBadge.style.backgroundColor = typeColors[typeInfo.type.name] || '#999';
                typeBadge.style.color = 'white';
                typeBadge.style.padding = '4px 8px';
                typeBadge.style.borderRadius = '12px';
                typeBadge.style.fontSize = '12px';
                typeBadge.style.fontWeight = 'bold';
                typeBadge.className = 'pokemon-type';
                typeBadge.dataset.type = typeInfo.type.name;
                typesContainer.appendChild(typeBadge);
            });

            // Create stats container
            const statsContainer = document.createElement('div');
            statsContainer.style.display = 'flex';
            statsContainer.style.gap = '15px';
            statsContainer.style.fontSize = '14px';

            // Weight
            const weightSpan = document.createElement('span');
            weightSpan.innerHTML = `<strong>Weight:</strong> ${(pokemonData.weight / 10).toFixed(1)} kg`;
            weightSpan.className = 'pokemon-weight';

            // Height
            const heightSpan = document.createElement('span');
            heightSpan.innerHTML = `<strong>Height:</strong> ${(pokemonData.height / 10).toFixed(1)} m`;
            heightSpan.className = 'pokemon-height';

            // Base Experience
            const expSpan = document.createElement('span');
            expSpan.innerHTML = `<strong>Base Exp:</strong> ${pokemonData.base_experience || 'N/A'}`;
            expSpan.className = 'pokemon-exp';

            statsContainer.appendChild(weightSpan);
            statsContainer.appendChild(heightSpan);
            statsContainer.appendChild(expSpan);

            // Create abilities container
            const abilitiesContainer = document.createElement('div');
            abilitiesContainer.style.fontSize = '14px';
            
            const abilitiesLabel = document.createElement('span');
            abilitiesLabel.innerHTML = '<strong>Abilities:</strong> ';
            abilitiesContainer.appendChild(abilitiesLabel);
            
            const abilitiesText = pokemonData.abilities
                .map(ability => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1))
                .join(', ');
            const abilitiesSpan = document.createElement('span');
            abilitiesSpan.textContent = abilitiesText;
            abilitiesSpan.className = 'pokemon-abilities';
            abilitiesContainer.appendChild(abilitiesSpan);

            // Assemble info container
            infoContainer.appendChild(nameSpan);
            infoContainer.appendChild(typesContainer);
            infoContainer.appendChild(statsContainer);
            infoContainer.appendChild(abilitiesContainer);

            // Assemble pokemon item
            pokemonItem.appendChild(img);
            pokemonItem.appendChild(infoContainer);

            // Add to container immediately
            container.appendChild(pokemonItem);

            // Fade in animation
            setTimeout(() => {
                pokemonItem.style.opacity = '1';
            }, 10);

            loadedCount++;

            // Update loading indicator
            loadingDiv.textContent = `Loading Pokemon... (${loadedCount}/${pokemonList.length})`;

        } catch (error) {
            console.error(`Error fetching ${pokemon.name}:`, error);
            loadedCount++;
            loadingDiv.textContent = `Loading Pokemon... (${loadedCount}/${pokemonList.length})`;
        }
    }

    // Remove loading indicator when done and add search functionality
    loadingDiv.textContent = `Loaded ${loadedCount} Pokemon!`;
    setTimeout(() => {
        if (loadingDiv.parentNode) {
            loadingDiv.remove();
        }
        addEnhancedSearchFunctionality(container);
    }, 2000);
}

function addEnhancedSearchFunctionality(container) {
    // Remove the button
    const oldButton = document.getElementById('show-pokemon');
    if (oldButton) oldButton.remove();

    // Create main search container
    const searchMainContainer = document.createElement('div');
    searchMainContainer.style.display = 'flex';
    searchMainContainer.style.flexDirection = 'column';
    searchMainContainer.style.alignItems = 'center';
    searchMainContainer.style.margin = '20px 0';
    searchMainContainer.style.gap = '15px';

    // Create search input container
    const searchInputContainer = document.createElement('div');
    searchInputContainer.style.display = 'flex';
    searchInputContainer.style.gap = '10px';
    searchInputContainer.style.alignItems = 'center';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by name, type, or ability...';
    searchInput.style.padding = '10px';
    searchInput.style.fontSize = '16px';
    searchInput.style.width = '300px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #ccc';

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.padding = '10px 15px';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';

    const newSearchButton = document.createElement('button');
    newSearchButton.textContent = 'New Search';
    newSearchButton.style.padding = '10px 15px';
    newSearchButton.style.backgroundColor = '#4CAF50';
    newSearchButton.style.color = 'white';
    newSearchButton.style.border = 'none';
    newSearchButton.style.borderRadius = '4px';
    newSearchButton.style.cursor = 'pointer';

    searchInputContainer.appendChild(searchInput);
    searchInputContainer.appendChild(clearButton);
    searchInputContainer.appendChild(newSearchButton);

    // Create instruction text for multi-select
    const instructionText = document.createElement('div');
    instructionText.textContent = 'Hold Shift to select multiple types';
    instructionText.style.fontSize = '12px';
    instructionText.style.color = '#666';
    instructionText.style.fontStyle = 'italic';

    // Create type filter buttons
    const typeFilterContainer = document.createElement('div');
    typeFilterContainer.style.display = 'flex';
    typeFilterContainer.style.flexWrap = 'wrap';
    typeFilterContainer.style.gap = '5px';
    typeFilterContainer.style.justifyContent = 'center';
    typeFilterContainer.style.maxWidth = '600px';

    const allTypesButton = document.createElement('button');
    allTypesButton.textContent = 'All Types';
    allTypesButton.style.padding = '5px 10px';
    allTypesButton.style.backgroundColor = '#333';
    allTypesButton.style.color = 'white';
    allTypesButton.style.border = 'none';
    allTypesButton.style.borderRadius = '15px';
    allTypesButton.style.cursor = 'pointer';
    allTypesButton.style.fontSize = '12px';
    allTypesButton.classList.add('active-filter');
    typeFilterContainer.appendChild(allTypesButton);

    Object.keys(typeColors).forEach(type => {
        const typeButton = document.createElement('button');
        typeButton.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeButton.style.padding = '5px 10px';
        typeButton.style.backgroundColor = typeColors[type];
        typeButton.style.color = 'white';
        typeButton.style.border = 'none';
        typeButton.style.borderRadius = '15px';
        typeButton.style.cursor = 'pointer';
        typeButton.style.fontSize = '12px';
        typeButton.dataset.type = type;
        typeFilterContainer.appendChild(typeButton);
    });

    // Create result count display
    const resultCount = document.createElement('div');
    resultCount.style.textAlign = 'center';
    resultCount.style.fontSize = '16px';
    resultCount.style.color = '#333';
    resultCount.style.fontWeight = 'bold';

    // Assemble search container
    searchMainContainer.appendChild(searchInputContainer);
    searchMainContainer.appendChild(instructionText);
    searchMainContainer.appendChild(typeFilterContainer);
    searchMainContainer.appendChild(resultCount);

    // Insert search bar at top
    document.body.insertBefore(searchMainContainer, container);

    let activeTypeFilters = new Set(); // Changed from single filter to Set for multiple

    function updateResultCount(visibleCount, totalCount) {
        if (searchInput.value.trim() || activeTypeFilters.size > 0) {
            resultCount.textContent = `${visibleCount} of ${totalCount} Pokemon shown`;
        } else {
            resultCount.textContent = `${totalCount} Pokemon`;
        }
    }

    function filterPokemon() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;
        const totalCount = container.children.length;

        Array.from(container.children).forEach(item => {
            const nameElement = item.querySelector('div > div:first-child');
            const typeElements = item.querySelectorAll('.pokemon-type');
            const abilitiesElement = item.querySelector('.pokemon-abilities');
            
            const name = nameElement ? nameElement.textContent.toLowerCase() : '';
            const types = Array.from(typeElements).map(el => el.dataset.type);
            const abilities = abilitiesElement ? abilitiesElement.textContent.toLowerCase() : '';

            let matchesSearch = !query || 
                name.includes(query) || 
                types.some(type => type.includes(query)) ||
                abilities.includes(query);

            // Check if Pokemon has ANY of the selected types (OR logic)
            let matchesType = activeTypeFilters.size === 0 || 
                types.some(type => activeTypeFilters.has(type));

            if (matchesSearch && matchesType) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        updateResultCount(visibleCount, totalCount);
    }

    function updateTypeButtonStyles() {
        // Update all type buttons to show selection state
        Object.keys(typeColors).forEach(type => {
            const button = typeFilterContainer.querySelector(`[data-type="${type}"]`);
            if (button) {
                if (activeTypeFilters.has(type)) {
                    button.classList.add('active-filter');
                } else {
                    button.classList.remove('active-filter');
                }
            }
        });

        // Update "All Types" button
        if (activeTypeFilters.size === 0) {
            allTypesButton.classList.add('active-filter');
        } else {
            allTypesButton.classList.remove('active-filter');
        }
    }

    // Event listeners
    searchInput.addEventListener('input', filterPokemon);

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        activeTypeFilters.clear();
        updateTypeButtonStyles();
        filterPokemon();
    });

    newSearchButton.addEventListener('click', displayPokemon);

    // "All Types" button
    allTypesButton.addEventListener('click', () => {
        activeTypeFilters.clear();
        updateTypeButtonStyles();
        filterPokemon();
    });

    // Type filter buttons with shift-click support
    typeFilterContainer.addEventListener('click', (e) => {
        if (e.target.dataset.type) {
            const clickedType = e.target.dataset.type;
            
            if (e.shiftKey) {
                // Shift+click: toggle the type in the selection
                if (activeTypeFilters.has(clickedType)) {
                    activeTypeFilters.delete(clickedType);
                } else {
                    activeTypeFilters.add(clickedType);
                }
            } else {
                // Regular click: select only this type (clear others)
                activeTypeFilters.clear();
                activeTypeFilters.add(clickedType);
            }
            
            updateTypeButtonStyles();
            filterPokemon();
        }
    });

    // Initial count and styling
    updateResultCount(container.children.length, container.children.length);
    updateTypeButtonStyles();

    // Add CSS for active filter
    const style = document.createElement('style');
    style.textContent = `
        .active-filter {
            box-shadow: 0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px #333 !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// Update displaySinglePokemon to show enhanced info too
async function displaySinglePokemon(pokemonData) {
    // Clear body and show single Pokemon
    document.body.innerHTML = '';
    
    // Re-add button first
    const newButton = document.createElement("button");
    newButton.id = "show-pokemon";
    newButton.textContent = "Show Pokemon";
    newButton.addEventListener("click", displayPokemon);
    document.body.appendChild(newButton);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    // Get primary type for theming
    const primaryType = pokemonData.types[0].type.name;
    const primaryColor = typeColors[primaryType] || '#ccc';

    const pokemonItem = document.createElement('div');
    pokemonItem.style.display = 'flex';
    pokemonItem.style.alignItems = 'center';
    pokemonItem.style.gap = '20px';
    pokemonItem.style.padding = '20px';
    pokemonItem.style.border = `3px solid ${primaryColor}`;
    pokemonItem.style.borderRadius = '15px';
    pokemonItem.style.background = `linear-gradient(135deg, ${primaryColor}20, transparent)`;
    pokemonItem.style.maxWidth = '600px';

    const img = document.createElement('img');
    img.src = pokemonData.sprites.front_default;
    img.alt = pokemonData.name;
    img.style.width = '150px';
    img.style.height = '150px';

    // Create detailed info container (reuse the same structure as list view)
    const infoContainer = document.createElement('div');
    infoContainer.style.display = 'flex';
    infoContainer.style.flexDirection = 'column';
    infoContainer.style.gap = '10px';

    // Name and ID
    const nameSpan = document.createElement('div');
    nameSpan.innerHTML = `<strong style="font-size: 24px; color: ${primaryColor};">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</strong> <span style="color: #666; font-size: 18px;">(#${pokemonData.id})</span>`;

    // Types (same as list view)
    const typesContainer = document.createElement('div');
    typesContainer.style.display = 'flex';
    typesContainer.style.gap = '5px';
    typesContainer.style.alignItems = 'center';
    
    const typeLabel = document.createElement('span');
    typeLabel.textContent = 'Type: ';
    typeLabel.style.fontWeight = 'bold';
    typesContainer.appendChild(typeLabel);

    pokemonData.types.forEach(typeInfo => {
        const typeBadge = document.createElement('span');
        typeBadge.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
        typeBadge.style.backgroundColor = typeColors[typeInfo.type.name] || '#999';
        typeBadge.style.color = 'white';
        typeBadge.style.padding = '6px 12px';
        typeBadge.style.borderRadius = '15px';
        typeBadge.style.fontSize = '14px';
        typeBadge.style.fontWeight = 'bold';
        typesContainer.appendChild(typeBadge);
    });

    // Stats
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'flex';
    statsContainer.style.flexDirection = 'column';
    statsContainer.style.gap = '5px';

    const weightHeight = document.createElement('div');
    weightHeight.innerHTML = `<strong>Weight:</strong> ${(pokemonData.weight / 10).toFixed(1)} kg | <strong>Height:</strong> ${(pokemonData.height / 10).toFixed(1)} m | <strong>Base Exp:</strong> ${pokemonData.base_experience || 'N/A'}`;

    // Abilities
    const abilitiesDiv = document.createElement('div');
    const abilitiesText = pokemonData.abilities
        .map(ability => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1))
        .join(', ');
    abilitiesDiv.innerHTML = `<strong>Abilities:</strong> ${abilitiesText}`;

    statsContainer.appendChild(weightHeight);
    statsContainer.appendChild(abilitiesDiv);

    infoContainer.appendChild(nameSpan);
    infoContainer.appendChild(typesContainer);
    infoContainer.appendChild(statsContainer);

    pokemonItem.appendChild(img);
    pokemonItem.appendChild(infoContainer);
    container.appendChild(pokemonItem);
    document.body.appendChild(container);
}
