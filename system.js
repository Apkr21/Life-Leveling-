// Life System - Solo Leveling IRL
// Complete RPG-style life improvement system

class LifeSystem {
    constructor() {
        this.data = this.loadData();
        this.currentTab = 'dashboard';
        this.charts = {};
        this.timers = {};
        
        this.init();
    }

    // Initialize the system
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.initializeCharts();
        this.updateDateTime();
        this.generateDailyQuests();
        this.checkLevelUp();
        
        // Update time every second
        setInterval(() => {
            this.updateDateTime();
            this.updateStats();
        }, 1000);
        
        // Initialize system start date if not set
        if (!this.data.systemStartDate) {
            this.data.systemStartDate = Date.now();
            this.saveData();
        }
    }

    // Load data from localStorage
    loadData() {
        const defaultData = {
            // Player Info
            playerName: 'Champion',
            level: 1,
            xp: 0,
            totalXP: 0,
            rank: 'Bronze',
            
            // Stats
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            energy: 100,
            maxEnergy: 100,
            
            // Character Stats
            strength: 10,
            intelligence: 10,
            endurance: 10,
            wisdom: 10,
            
            // Discipline System (Core Addiction Recovery)
            cleanStreak: 0,
            longestCleanStreak: 0,
            urgesDefeated: 0,
            totalRelapses: 0,
            disciplineLevel: 1,
            disciplineXP: 0,
            
            // Addiction Recovery Systems
            pornRecovery: {
                cleanDays: 0,
                longestStreak: 0,
                urgesDefeated: 0,
                totalRelapses: 0,
                startDate: Date.now(),
                lastResetDate: null,
                milestones: []
            },
            
            alcoholRecovery: {
                soberDays: 0,
                longestStreak: 0,
                cravingsBeaten: 0,
                totalRelapses: 0,
                startDate: Date.now(),
                lastResetDate: null,
                milestones: []
            },
            
            // Life Areas
            workoutStreak: 0,
            nutritionScore: 0,
            sleepQuality: 0,
            dailyWorkouts: 0,
            mealsToday: 0,
            todayTrainingXP: 0,
            todayExercises: 0,
            
            // Tracking Data
            workouts: [],
            quickExercises: [],
            meals: [],
            sleepLogs: [],
            journalEntries: [],
            urgeVictories: [],
            emergencyActions: [],
            
            // System Data
            systemStartDate: Date.now(),
            lastLoginDate: null,
            disciplineStartDate: Date.now(),
            
            // Quests
            dailyQuests: [],
            weeklyQuests: [],
            specialQuests: [],
            completedQuests: [],
            
            // Skills
            unlockedSkills: ['basic-discipline', 'basic-fitness', 'basic-nutrition', 'basic-meditation'],
            skillProgress: {},
            
            // Achievements
            achievements: [],
            
            // Settings
            lastQuestGeneration: null,
            lastMoodDate: null
        };

        const saved = localStorage.getItem('lifeSystemData');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...defaultData, ...parsed };
        }
        return defaultData;
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('lifeSystemData', JSON.stringify(this.data));
    }

    // Setup all event listeners
    setupEventListeners() {
        // Tab navigation - fix selector
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.nav-tab').dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.closest('.quick-action-btn').dataset.action);
            });
        });

        // Emergency help button
        document.getElementById('emergency-help-btn').addEventListener('click', () => {
            this.switchTab('discipline');
        });

        // Discipline actions
        document.getElementById('defeat-urge-btn').addEventListener('click', () => {
            this.defeatUrge();
        });

        document.getElementById('relapse-btn').addEventListener('click', () => {
            this.handleRelapse();
        });

        // Emergency buttons
        document.querySelectorAll('.emergency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.useEmergencyTool(e.target.closest('.emergency-btn').dataset.emergency);
            });
        });

        // Quick exercise buttons
        document.querySelectorAll('.quick-exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.logQuickExercise(e.target.closest('.quick-exercise-btn').dataset.exercise);
            });
        });

        // Detailed workout form
        document.getElementById('detailed-workout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logDetailedWorkout();
        });

        // Discipline quotes
        document.getElementById('new-discipline-quote').addEventListener('click', () => {
            this.showNewDisciplineQuote();
        });

        // Meal form
        document.getElementById('meal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logMeal();
        });

        // Sleep form
        document.getElementById('sleep-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logSleep();
        });

        // Journal form
        document.getElementById('journal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJournalEntry();
        });

        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(parseInt(e.target.closest('.mood-btn').dataset.mood));
            });
        });

        // Range inputs for displaying values (check if elements exist)
        const workoutIntensity = document.getElementById('workout-intensity');
        if (workoutIntensity) {
            workoutIntensity.addEventListener('input', (e) => {
                const display = document.getElementById('intensity-display');
                if (display) display.textContent = e.target.value;
            });
        }

        const mealHealth = document.getElementById('meal-health');
        if (mealHealth) {
            mealHealth.addEventListener('input', (e) => {
                const display = document.getElementById('health-display');
                if (display) display.textContent = e.target.value;
            });
        }

        const sleepQuality = document.getElementById('sleep-quality-input');
        if (sleepQuality) {
            sleepQuality.addEventListener('input', (e) => {
                const display = document.getElementById('quality-display');
                if (display) display.textContent = e.target.value;
            });
        }

        // Recovery Tab Event Listeners
        
        // Porn addiction recovery buttons
        const pornUrgeBtn = document.getElementById('porn-urge-victory');
        if (pornUrgeBtn) {
            pornUrgeBtn.addEventListener('click', () => {
                this.defeatPornUrge();
            });
        }
        
        const pornRelapseBtn = document.getElementById('porn-relapse');
        if (pornRelapseBtn) {
            pornRelapseBtn.addEventListener('click', () => {
                this.resetPornRecovery();
            });
        }
        
        // Alcohol recovery buttons
        const alcoholCravingBtn = document.getElementById('alcohol-craving-victory');
        if (alcoholCravingBtn) {
            alcoholCravingBtn.addEventListener('click', () => {
                this.beatAlcoholCraving();
            });
        }
        
        const alcoholRelapseBtn = document.getElementById('alcohol-relapse');
        if (alcoholRelapseBtn) {
            alcoholRelapseBtn.addEventListener('click', () => {
                this.resetAlcoholRecovery();
            });
        }
        
        // Emergency toolkit buttons
        document.querySelectorAll('.emergency-tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.closest('.emergency-tool-btn').dataset.tool;
                this.useEmergencyRecoveryTool(tool);
            });
        });

        // Desktop keyboard shortcuts
        this.setupDesktopKeyboardShortcuts();
    }

    // Desktop keyboard shortcuts
    setupDesktopKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only activate shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Use Ctrl/Cmd + number keys for tab navigation
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['dashboard', 'recovery', 'discipline', 'training', 'nutrition', 'rest', 'quests', 'journal', 'stats'];
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
            
            // Quick action shortcuts
            if (e.altKey) {
                switch(e.key.toLowerCase()) {
                    case 'p': // Alt+P for porn urge victory
                        const pornBtn = document.getElementById('porn-urge-victory');
                        if (pornBtn) {
                            e.preventDefault();
                            this.defeatPornUrge();
                        }
                        break;
                    case 'a': // Alt+A for alcohol craving victory
                        const alcoholBtn = document.getElementById('alcohol-craving-victory');
                        if (alcoholBtn) {
                            e.preventDefault();
                            this.beatAlcoholCraving();
                        }
                        break;
                    case 'e': // Alt+E for emergency (go to discipline)
                        e.preventDefault();
                        this.switchTab('discipline');
                        break;
                    case 'r': // Alt+R for recovery tab
                        e.preventDefault();
                        this.switchTab('recovery');
                        break;
                }
            }
        });
    }

    // Update date and time display
    updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
        
        // Update time
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', timeOptions);
    }

    // Update all UI elements
    updateUI() {
        this.updatePlayerInfo();
        this.updateStatusBars();
        this.updateStreaks();
        this.updateRecoveryUI();
        this.updateQuests();
        this.updateHistory();
        this.updateStats();
        this.initializeSystemMessages();
    }

    // Update player information
    updatePlayerInfo() {
        document.getElementById('player-name').textContent = this.data.playerName;
        document.getElementById('player-level').textContent = this.data.level;
        
        // Update rank badge
        const rankBadge = document.getElementById('player-rank');
        rankBadge.textContent = this.data.rank.toUpperCase();
        rankBadge.className = `rank-badge rank-${this.data.rank.toLowerCase()}`;
    }

    // Update status bars
    updateStatusBars() {
        // Health
        const healthPercent = (this.data.health / this.data.maxHealth) * 100;
        document.getElementById('health-bar').style.width = `${healthPercent}%`;
        document.getElementById('health-value').textContent = `${this.data.health}/${this.data.maxHealth}`;

        // Mana
        const manaPercent = (this.data.mana / this.data.maxMana) * 100;
        document.getElementById('mana-bar').style.width = `${manaPercent}%`;
        document.getElementById('mana-value').textContent = `${this.data.mana}/${this.data.maxMana}`;

        // Energy
        const energyPercent = (this.data.energy / this.data.maxEnergy) * 100;
        document.getElementById('energy-bar').style.width = `${energyPercent}%`;
        document.getElementById('energy-value').textContent = `${this.data.energy}/${this.data.maxEnergy}`;

        // XP
        const xpRequired = this.getXPRequired(this.data.level);
        const xpPercent = (this.data.xp / xpRequired) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
        document.getElementById('xp-value').textContent = `${this.data.xp}/${xpRequired}`;
    }

    // Update streaks and scores
    updateStreaks() {
        this.calculateStreaks();
        
        // Dashboard updates
        document.getElementById('clean-streak').textContent = this.data.cleanStreak;
        document.getElementById('urges-defeated').textContent = this.data.urgesDefeated;
        document.getElementById('daily-workouts').textContent = this.data.dailyWorkouts;
        document.getElementById('workout-streak-display').textContent = `${this.data.workoutStreak} day streak`;
        document.getElementById('nutrition-score').textContent = `${this.data.nutritionScore}/100`;
        document.getElementById('meals-today').textContent = `${this.data.mealsToday} meals logged`;
        
        // Sleep display
        const sleepQualityElement = document.getElementById('sleep-quality');
        const sleepHoursElement = document.getElementById('sleep-hours');
        if (this.data.sleepQuality > 0) {
            sleepQualityElement.textContent = `${this.data.sleepQuality}/100`;
            const lastSleep = this.data.sleepLogs[0];
            if (lastSleep) {
                sleepHoursElement.textContent = `${lastSleep.duration.toFixed(1)} hours`;
            }
        } else {
            sleepQualityElement.textContent = '--';
            sleepHoursElement.textContent = '-- hours';
        }
        
        // Discipline tab updates
        if (document.getElementById('discipline-level')) {
            document.getElementById('discipline-level').textContent = `Level ${this.data.disciplineLevel}`;
            document.getElementById('clean-days-display').textContent = this.data.cleanStreak;
            document.getElementById('urges-defeated-display').textContent = this.data.urgesDefeated;
            document.getElementById('longest-clean-streak').textContent = this.data.longestCleanStreak;
            
            // Calculate success rate
            const totalDays = Math.floor((Date.now() - this.data.systemStartDate) / (1000 * 60 * 60 * 24));
            const successRate = totalDays > 0 ? Math.round((this.data.cleanStreak / totalDays) * 100) : 100;
            document.getElementById('discipline-success-rate').textContent = `${Math.min(successRate, 100)}%`;
        }
        
        // Training stats updates
        if (document.getElementById('today-training-xp')) {
            document.getElementById('today-training-xp').textContent = this.data.todayTrainingXP;
            document.getElementById('today-exercises').textContent = this.data.todayExercises;
            document.getElementById('total-workouts').textContent = this.data.workouts.length + this.data.quickExercises.length;
            document.getElementById('workout-streak-stat').textContent = `${this.data.workoutStreak} days`;
        }
    }

    // Calculate current streaks
    calculateStreaks() {
        const today = new Date().toDateString();
        
        // Clean streak (days since discipline start)
        const daysSinceStart = Math.floor((Date.now() - this.data.disciplineStartDate) / (1000 * 60 * 60 * 24));
        this.data.cleanStreak = Math.max(0, daysSinceStart);
        
        // Update longest streak
        if (this.data.cleanStreak > this.data.longestCleanStreak) {
            this.data.longestCleanStreak = this.data.cleanStreak;
        }
        
        // Workout streak
        this.data.workoutStreak = this.calculateConsecutiveDays([...this.data.workouts, ...this.data.quickExercises]);
        
        // Daily workout count
        const todaysWorkouts = [...this.data.workouts, ...this.data.quickExercises].filter(workout => 
            new Date(workout.date).toDateString() === today
        );
        this.data.dailyWorkouts = todaysWorkouts.length;
        this.data.todayExercises = todaysWorkouts.length;
        
        // Today's training XP
        this.data.todayTrainingXP = todaysWorkouts.reduce((sum, workout) => sum + (workout.xpGained || 0), 0);
        
        // Nutrition score (today's average meal health)
        const todaysMeals = this.data.meals.filter(meal => 
            new Date(meal.date).toDateString() === today
        );
        this.data.mealsToday = todaysMeals.length;
        if (todaysMeals.length > 0) {
            this.data.nutritionScore = Math.round(
                todaysMeals.reduce((sum, meal) => sum + meal.health, 0) / todaysMeals.length * 10
            );
        }
        
        // Sleep quality (last sleep entry)
        const lastSleep = this.data.sleepLogs[this.data.sleepLogs.length - 1];
        if (lastSleep && new Date(lastSleep.date).toDateString() === today) {
            this.data.sleepQuality = lastSleep.quality * 10;
        }
    }

    // Calculate consecutive days for any activity
    calculateConsecutiveDays(activities) {
        if (activities.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) { // Check last 30 days
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateString = checkDate.toDateString();
            
            const hasActivity = activities.some(activity => 
                new Date(activity.date).toDateString() === checkDateString
            );
            
            if (hasActivity) {
                streak++;
            } else if (i === 0) {
                // If no activity today, check yesterday
                continue;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Get XP required for level
    getXPRequired(level) {
        return level * 100 + (level - 1) * 50; // Increasing XP requirement
    }

    // Add XP and check for level up
    addXP(amount, source = 'Action') {
        this.data.xp += amount;
        this.data.totalXP += amount;
        
        this.showXPNotification(amount, source);
        this.checkLevelUp();
        this.updateStatusBars();
        this.saveData();
    }

    // Check if player should level up
    checkLevelUp() {
        const xpRequired = this.getXPRequired(this.data.level);
        
        if (this.data.xp >= xpRequired) {
            this.levelUp();
        }
    }

    // Level up the player
    levelUp() {
        const xpRequired = this.getXPRequired(this.data.level);
        this.data.xp -= xpRequired;
        this.data.level++;
        
        // Increase stats on level up
        this.data.strength += Math.floor(Math.random() * 3) + 1;
        this.data.intelligence += Math.floor(Math.random() * 3) + 1;
        this.data.endurance += Math.floor(Math.random() * 3) + 1;
        this.data.wisdom += Math.floor(Math.random() * 3) + 1;
        
        // Increase max stats
        this.data.maxHealth += 10;
        this.data.maxMana += 10;
        this.data.maxEnergy += 10;
        
        // Restore stats on level up
        this.data.health = this.data.maxHealth;
        this.data.mana = this.data.maxMana;
        this.data.energy = this.data.maxEnergy;
        
        // Update rank
        this.updateRank();
        
        this.showLevelUpNotification();
        this.updateUI();
        this.saveData();
        
        // Check for skill unlocks
        this.checkSkillUnlocks();
    }

    // Update player rank based on level
    updateRank() {
        if (this.data.level >= 50) this.data.rank = 'Legend';
        else if (this.data.level >= 30) this.data.rank = 'Master';
        else if (this.data.level >= 20) this.data.rank = 'Diamond';
        else if (this.data.level >= 10) this.data.rank = 'Platinum';
        else if (this.data.level >= 5) this.data.rank = 'Gold';
        else if (this.data.level >= 2) this.data.rank = 'Silver';
        else this.data.rank = 'Bronze';
    }

    // Show XP notification
    showXPNotification(amount, source) {
        const notification = document.getElementById('xp-notification');
        const text = document.getElementById('xp-text');
        
        text.textContent = `+${amount} XP - ${source}`;
        notification.classList.remove('translate-x-full');
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 3000);
    }

    // Show level up notification
    showLevelUpNotification() {
        const notification = document.getElementById('levelup-notification');
        const levelSpan = document.getElementById('new-level');
        
        levelSpan.textContent = this.data.level;
        notification.classList.remove('hidden');
        notification.classList.add('level-up');
        
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.classList.remove('level-up');
        }, 3000);
    }

    // Switch tabs
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons - fix class names
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Update charts if switching to stats tab
        if (tabName === 'stats') {
            setTimeout(() => this.updateCharts(), 100);
        }
        
        // Update history when switching to relevant tabs
        if (['discipline', 'training', 'nutrition', 'rest', 'journal'].includes(tabName)) {
            setTimeout(() => this.updateHistory(), 100);
        }
    }

    // Handle quick actions
    handleQuickAction(action) {
        switch(action) {
            case 'quick-workout':
                this.switchTab('training');
                break;
            case 'urge-victory':
                this.defeatUrge();
                break;
            case 'meditation':
                this.addXP(15, 'Meditation');
                this.addSystemMessage('✓ Meditation completed. +15 XP', 'text-green-400');
                break;
            case 'cold-shower':
                this.useEmergencyTool('cold-shower');
                break;
        }
    }

    // Defeat an urge
    defeatUrge() {
        this.data.urgesDefeated++;
        
        const victory = {
            id: Date.now(),
            date: Date.now(),
            dateString: new Date().toDateString(),
            method: 'Self-control victory'
        };
        
        this.data.urgeVictories.unshift(victory);
        
        // Big XP reward for defeating urges
        this.addXP(25, 'Urge Victory');
        
        this.updateUI();
        this.checkQuestProgress('urge-defeat');
        this.addSystemMessage('🏆 VICTORY! You conquered that challenge! +25 XP', 'text-purple-400');
        
        // Check for discipline level up
        this.checkDisciplineLevelUp();
        
        this.saveData();
    }

    // Handle relapse with compassion
    handleRelapse() {
        if (confirm('Remember: You are not your mistakes. A relapse doesn\'t erase your progress - it\'s just data. Are you ready to restart your journey?')) {
            // Reset clean streak but keep other progress
            this.data.totalRelapses++;
            this.data.disciplineStartDate = Date.now();
            this.data.cleanStreak = 0;
            
            this.updateUI();
            this.saveData();
            
            // Compassionate message
            this.addSystemMessage('💪 Journey restarted. You\'re still a champion. Every legend faces setbacks.', 'text-blue-400');
            
            // Switch to emergency tools
            this.switchTab('discipline');
        }
    }

    // Check discipline level up
    checkDisciplineLevelUp() {
        const currentLevel = Math.floor(this.data.cleanStreak / 7) + 1; // Level up every week
        if (currentLevel > this.data.disciplineLevel) {
            this.data.disciplineLevel = currentLevel;
            this.addSystemMessage(`🎊 DISCIPLINE LEVEL UP! Now Level ${currentLevel}`, 'text-gold-400');
        }
    }

    // Use emergency tool
    useEmergencyTool(tool) {
        const messages = {
            'pushups': '💪 20 Push-ups completed! Your body is your fortress!',
            'cold-shower': '🚿 Cold shower taken! You reset your nervous system!',
            'breathing': '🫁 Breathing exercise completed! You found your center!',
            'walk': '🚶 Walk completed! You changed your environment and mindset!',
            'call': '📞 Remember: Reaching out shows strength, not weakness!'
        };
        
        const emergency = {
            id: Date.now(),
            date: Date.now(),
            tool: tool,
            dateString: new Date().toDateString()
        };
        
        this.data.emergencyActions.unshift(emergency);
        
        // XP reward for using emergency tools
        this.addXP(15, `Emergency: ${tool}`);
        this.addSystemMessage(messages[tool] || 'Emergency tool used!', 'text-green-400');
        
        this.saveData();
    }

    // Porn Addiction Recovery Functions
    defeatPornUrge() {
        this.data.pornRecovery.urgesDefeated++;
        
        // Award XP
        this.addXP(30, 'Porn Urge Victory');
        
        // Log victory
        const victory = {
            id: Date.now(),
            date: Date.now(),
            type: 'porn_urge_victory',
            dateString: new Date().toDateString()
        };
        
        this.data.urgeVictories.unshift(victory);
        this.updateRecoveryUI();
        this.checkRecoveryMilestones();
        this.addSystemMessage('🏆 VICTORY! You defeated a porn urge! Your discipline is growing stronger! +30 XP', 'text-red-400');
        
        this.saveData();
    }

    resetPornRecovery() {
        if (confirm('Are you ready to restart your porn addiction recovery journey? Remember, relapses are part of recovery - you\'re still making progress.')) {
            // Update statistics
            this.data.pornRecovery.totalRelapses++;
            if (this.data.pornRecovery.cleanDays > this.data.pornRecovery.longestStreak) {
                this.data.pornRecovery.longestStreak = this.data.pornRecovery.cleanDays;
            }
            
            // Reset counters
            this.data.pornRecovery.cleanDays = 0;
            this.data.pornRecovery.startDate = Date.now();
            this.data.pornRecovery.lastResetDate = Date.now();
            
            this.updateRecoveryUI();
            this.addSystemMessage('💪 Porn recovery restarted. You\'re still a warrior. Every setback is setup for a comeback.', 'text-red-400');
            
            this.saveData();
        }
    }

    // Alcohol Recovery Functions
    beatAlcoholCraving() {
        this.data.alcoholRecovery.cravingsBeaten++;
        
        // Award XP
        this.addXP(25, 'Alcohol Craving Victory');
        
        // Log victory
        const victory = {
            id: Date.now(),
            date: Date.now(),
            type: 'alcohol_craving_victory',
            dateString: new Date().toDateString()
        };
        
        this.data.urgeVictories.unshift(victory);
        this.updateRecoveryUI();
        this.checkRecoveryMilestones();
        this.addSystemMessage('🏆 VICTORY! You beat an alcohol craving! Your sobriety is your strength! +25 XP', 'text-orange-400');
        
        this.saveData();
    }

    resetAlcoholRecovery() {
        if (confirm('Are you ready to restart your alcohol recovery journey? Recovery is not linear - you\'re learning and growing stronger.')) {
            // Update statistics
            this.data.alcoholRecovery.totalRelapses++;
            if (this.data.alcoholRecovery.soberDays > this.data.alcoholRecovery.longestStreak) {
                this.data.alcoholRecovery.longestStreak = this.data.alcoholRecovery.soberDays;
            }
            
            // Reset counters
            this.data.alcoholRecovery.soberDays = 0;
            this.data.alcoholRecovery.startDate = Date.now();
            this.data.alcoholRecovery.lastResetDate = Date.now();
            
            this.updateRecoveryUI();
            this.addSystemMessage('💪 Alcohol recovery restarted. You\'re resilient. Each day sober is a victory.', 'text-orange-400');
            
            this.saveData();
        }
    }

    // Emergency Recovery Toolkit
    useEmergencyRecoveryTool(tool) {
        const messages = {
            'cold-shower': '🚿 COLD SHOWER ACTIVATED! You\'ve reset your nervous system and broken the pattern!',
            'pushups': '💪 20 PUSH-UPS COMPLETED! You\'ve redirected that energy into strength!',
            'breathing': '🫁 DEEP BREATHING ACTIVATED! You\'ve found your center and calm!',
            'call-sponsor': '📞 REACH OUT FOR SUPPORT! Connection is strength, not weakness!',
            'walk': '🚶 ENVIRONMENT CHANGED! You\'ve physically moved away from triggers!',
            'meditation': '🧘 MEDITATION ACTIVATED! You\'ve found peace in the present moment!',
            'journal': '📝 FEELINGS EXPRESSED! Writing helps process and release emotions!',
            'distraction': '🎯 HEALTHY DISTRACTION! You\'ve engaged your mind elsewhere!'
        };
        
        const emergency = {
            id: Date.now(),
            date: Date.now(),
            tool: tool,
            type: 'recovery_emergency',
            dateString: new Date().toDateString()
        };
        
        this.data.emergencyActions.unshift(emergency);
        
        // Award XP for using emergency tools
        this.addXP(20, `Recovery Tool: ${tool}`);
        this.addSystemMessage(messages[tool] || 'Emergency recovery tool used!', 'text-green-400');
        
        this.saveData();
    }

    // Update Recovery UI
    updateRecoveryUI() {
        // Calculate days for both addictions
        const now = Date.now();
        const msPerDay = 24 * 60 * 60 * 1000;
        
        // Porn recovery days
        const pornDays = Math.floor((now - this.data.pornRecovery.startDate) / msPerDay);
        this.data.pornRecovery.cleanDays = Math.max(0, pornDays);
        
        // Alcohol recovery days  
        const alcoholDays = Math.floor((now - this.data.alcoholRecovery.startDate) / msPerDay);
        this.data.alcoholRecovery.soberDays = Math.max(0, alcoholDays);
        
        // Update porn recovery display
        const pornCleanDays = document.getElementById('porn-clean-days');
        if (pornCleanDays) pornCleanDays.textContent = this.data.pornRecovery.cleanDays;
        
        const pornUrgesDefeated = document.getElementById('porn-urges-defeated');
        if (pornUrgesDefeated) pornUrgesDefeated.textContent = this.data.pornRecovery.urgesDefeated;
        
        const pornLongestStreak = document.getElementById('porn-longest-streak');
        if (pornLongestStreak) pornLongestStreak.textContent = `${this.data.pornRecovery.longestStreak} days`;
        
        const pornTotalRelapses = document.getElementById('porn-total-relapses');
        if (pornTotalRelapses) pornTotalRelapses.textContent = this.data.pornRecovery.totalRelapses;
        
        const pornSuccessRate = document.getElementById('porn-success-rate');
        if (pornSuccessRate) {
            const totalDays = Math.floor((now - this.data.systemStartDate) / msPerDay);
            const successRate = totalDays > 0 ? Math.round((this.data.pornRecovery.cleanDays / totalDays) * 100) : 100;
            pornSuccessRate.textContent = `${successRate}%`;
        }
        
        // Update alcohol recovery display
        const alcoholSoberDays = document.getElementById('alcohol-sober-days');
        if (alcoholSoberDays) alcoholSoberDays.textContent = this.data.alcoholRecovery.soberDays;
        
        const alcoholCravingsBeaten = document.getElementById('alcohol-cravings-beaten');
        if (alcoholCravingsBeaten) alcoholCravingsBeaten.textContent = this.data.alcoholRecovery.cravingsBeaten;
        
        const alcoholLongestStreak = document.getElementById('alcohol-longest-streak');
        if (alcoholLongestStreak) alcoholLongestStreak.textContent = `${this.data.alcoholRecovery.longestStreak} days`;
        
        const alcoholTotalRelapses = document.getElementById('alcohol-total-relapses');
        if (alcoholTotalRelapses) alcoholTotalRelapses.textContent = this.data.alcoholRecovery.totalRelapses;
        
        const alcoholSuccessRate = document.getElementById('alcohol-success-rate');
        if (alcoholSuccessRate) {
            const totalDays = Math.floor((now - this.data.systemStartDate) / msPerDay);
            const successRate = totalDays > 0 ? Math.round((this.data.alcoholRecovery.soberDays / totalDays) * 100) : 100;
            alcoholSuccessRate.textContent = `${successRate}%`;
        }
        
        // Update milestone badges
        this.updateMilestoneBadges();
    }

    // Check recovery milestones
    checkRecoveryMilestones() {
        const pornDays = this.data.pornRecovery.cleanDays;
        const alcoholDays = this.data.alcoholRecovery.soberDays;
        
        // Update milestone badge visual states
        this.updateMilestoneBadges();
        
        // Check for major milestones and award extra XP
        if (pornDays === 1 || pornDays === 7 || pornDays === 30 || pornDays === 90) {
            this.addXP(50, `Porn Recovery Milestone: ${pornDays} days`);
            this.addSystemMessage(`🎉 MILESTONE ACHIEVED! ${pornDays} days porn-free! +50 bonus XP!`, 'text-gold-400');
        }
        
        if (alcoholDays === 1 || alcoholDays === 7 || alcoholDays === 30 || alcoholDays === 90 || alcoholDays === 365) {
            this.addXP(50, `Alcohol Recovery Milestone: ${alcoholDays} days`);
            this.addSystemMessage(`🎉 MILESTONE ACHIEVED! ${alcoholDays} days sober! +50 bonus XP!`, 'text-gold-400');
        }
    }

    // Update milestone badge visual states
    updateMilestoneBadges() {
        const pornDays = this.data.pornRecovery.cleanDays;
        const alcoholDays = this.data.alcoholRecovery.soberDays;
        
        // Update all milestone badges
        document.querySelectorAll('.milestone-badge').forEach(badge => {
            const type = badge.dataset.type;
            const requiredDays = parseInt(badge.dataset.days);
            
            if (type === 'porn') {
                if (pornDays >= requiredDays) {
                    badge.classList.add('achieved');
                    badge.classList.remove('locked');
                } else {
                    badge.classList.add('locked');
                    badge.classList.remove('achieved');
                }
            } else if (type === 'alcohol') {
                if (alcoholDays >= requiredDays) {
                    badge.classList.add('achieved');
                    badge.classList.remove('locked');
                } else {
                    badge.classList.add('locked');
                    badge.classList.remove('achieved');
                }
            }
        });
    }

    // Log quick exercise
    logQuickExercise(exerciseType) {
        const xpValues = {
            'pushups': 15,
            'squats': 15,
            'abs': 20,
            'cardio': 25,
            'pullups': 20,
            'plank': 15
        };
        
        const exercise = {
            id: Date.now(),
            date: Date.now(),
            type: exerciseType,
            category: 'quick',
            xpGained: xpValues[exerciseType] || 15,
            dateString: new Date().toDateString()
        };
        
        this.data.quickExercises.unshift(exercise);
        
        this.addXP(exercise.xpGained, `Quick ${exerciseType}`);
        this.updateUI();
        this.checkQuestProgress('workout');
        this.addSystemMessage(`💪 ${exerciseType} completed! +${exercise.xpGained} XP`, 'text-red-400');
        
        this.saveData();
    }

    // Log detailed workout
    logDetailedWorkout() {
        const exerciseType = document.getElementById('detailed-exercise-type').value;
        const sets = parseInt(document.getElementById('exercise-sets').value) || 0;
        const reps = parseInt(document.getElementById('exercise-reps').value) || 0;
        const weight = parseInt(document.getElementById('exercise-weight').value) || 0;
        const duration = parseInt(document.getElementById('exercise-duration').value) || 0;

        if (!exerciseType) {
            alert('Please select an exercise type.');
            return;
        }

        // Calculate XP based on sets, reps, weight, and duration
        let xpGained = 10; // Base XP
        xpGained += sets * 2;
        xpGained += Math.floor(reps / 5) * 3;
        xpGained += Math.floor(weight / 10) * 2;
        xpGained += Math.floor(duration / 5) * 2;
        xpGained = Math.min(xpGained, 100); // Cap at 100 XP

        const workout = {
            id: Date.now(),
            date: Date.now(),
            type: exerciseType,
            sets: sets,
            reps: reps,
            weight: weight,
            duration: duration,
            xpGained: xpGained,
            category: 'detailed',
            dateString: new Date().toDateString()
        };

        this.data.workouts.unshift(workout);
        
        this.addXP(xpGained, `Detailed ${exerciseType}`);
        
        // Clear form
        document.getElementById('detailed-workout-form').reset();
        
        this.updateHistory();
        this.checkQuestProgress('workout');
        this.addSystemMessage(`🏋️ ${exerciseType} completed! ${sets}×${reps} +${xpGained} XP`, 'text-red-400');
        
        this.saveData();
    }

    // Show new discipline quote
    showNewDisciplineQuote() {
        const quotes = [
            "The strongest people win battles we know nothing about.",
            "Discipline is choosing between what you want now and what you want most.",
            "Your future self is counting on the choices you make today.",
            "The pain of discipline weighs ounces. The pain of regret weighs tons.",
            "Every urge defeated makes you stronger than before.",
            "You are rewriting your story with every choice you make.",
            "Progress, not perfection. Every step forward counts.",
            "The hero's journey includes falling down and getting back up.",
            "Your worth isn't determined by your struggles, but by your resilience.",
            "Today's discipline is tomorrow's freedom.",
            "You are more powerful than your urges.",
            "Growth happens outside your comfort zone, including the discomfort of urges."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('discipline-quote').textContent = randomQuote;
    }

    // Log workout
    logWorkout() {
        const type = document.getElementById('workout-type').value;
        const duration = parseInt(document.getElementById('workout-duration').value);
        const intensity = parseInt(document.getElementById('workout-intensity').value);
        const notes = document.getElementById('workout-notes').value;

        if (!type || !duration) {
            alert('Please fill in workout type and duration.');
            return;
        }

        const workout = {
            id: Date.now(),
            date: Date.now(),
            type: type,
            duration: duration,
            intensity: intensity,
            notes: notes,
            dateString: new Date().toDateString()
        };

        this.data.workouts.unshift(workout);
        
        // Calculate XP based on duration and intensity
        const xpGained = Math.floor((duration / 10) * intensity);
        this.addXP(xpGained, 'Workout');
        
        // Clear form
        document.getElementById('workout-form').reset();
        document.getElementById('intensity-display').textContent = '5';
        
        this.updateUI();
        this.checkQuestProgress('workout');
        this.addSystemMessage(`✓ Workout logged! +${xpGained} XP`, 'text-green-400');
    }

    // Log meal
    logMeal() {
        const type = document.getElementById('meal-type').value;
        const items = document.getElementById('meal-items').value;
        const health = parseInt(document.getElementById('meal-health').value);
        const portion = document.getElementById('meal-portion').value;

        if (!type || !items) {
            alert('Please fill in meal type and items.');
            return;
        }

        const meal = {
            id: Date.now(),
            date: Date.now(),
            type: type,
            items: items,
            health: health,
            portion: portion,
            dateString: new Date().toDateString()
        };

        this.data.meals.unshift(meal);
        
        // Calculate XP based on health rating
        const xpGained = health * 2;
        this.addXP(xpGained, 'Healthy Meal');
        
        // Clear form
        document.getElementById('meal-form').reset();
        document.getElementById('health-display').textContent = '5';
        
        this.updateUI();
        this.checkQuestProgress('meal');
        this.addSystemMessage(`✓ Meal logged! +${xpGained} XP`, 'text-green-400');
    }

    // Log sleep
    logSleep() {
        const bedtime = document.getElementById('sleep-bedtime').value;
        const waketime = document.getElementById('sleep-waketime').value;
        const quality = parseInt(document.getElementById('sleep-quality-input').value);
        const notes = document.getElementById('sleep-notes').value;

        if (!bedtime || !waketime) {
            alert('Please fill in bedtime and wake time.');
            return;
        }

        // Calculate sleep duration
        const bedDate = new Date(`2000-01-01 ${bedtime}`);
        const wakeDate = new Date(`2000-01-01 ${waketime}`);
        if (wakeDate < bedDate) wakeDate.setDate(wakeDate.getDate() + 1);
        
        const duration = (wakeDate - bedDate) / (1000 * 60 * 60); // hours

        const sleepLog = {
            id: Date.now(),
            date: Date.now(),
            bedtime: bedtime,
            waketime: waketime,
            duration: duration,
            quality: quality,
            notes: notes,
            dateString: new Date().toDateString()
        };

        this.data.sleepLogs.unshift(sleepLog);
        
        // Calculate XP based on quality and duration (7-9 hours is optimal)
        const durationScore = duration >= 7 && duration <= 9 ? 1 : 0.7;
        const xpGained = Math.floor(quality * durationScore * 3);
        this.addXP(xpGained, 'Good Sleep');
        
        // Clear form
        document.getElementById('sleep-form').reset();
        document.getElementById('quality-display').textContent = '7';
        
        this.updateUI();
        this.checkQuestProgress('sleep');
        this.addSystemMessage(`✓ Sleep logged! ${duration.toFixed(1)}h, +${xpGained} XP`, 'text-green-400');
    }

    // Select mood for journal
    selectMood(mood) {
        // Highlight selected mood
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('border-blue-400', 'bg-blue-900/30');
        });
        
        event.target.closest('.mood-btn').classList.add('border-blue-400', 'bg-blue-900/30');
        
        // Store selected mood temporarily
        this.selectedMood = mood;
    }

    // Save journal entry
    saveJournalEntry() {
        const entryText = document.getElementById('journal-entry').value.trim();
        
        if (!entryText) {
            alert('Please write something in your journal first.');
            return;
        }

        if (!this.selectedMood) {
            alert('Please select your mood first.');
            return;
        }

        const entry = {
            id: Date.now(),
            date: Date.now(),
            dateString: new Date().toDateString(),
            text: entryText,
            mood: this.selectedMood
        };

        this.data.journalEntries.unshift(entry);
        
        // XP based on entry length and mood
        const xpGained = Math.min(20, Math.floor(entryText.length / 50) * 5 + 5);
        this.addXP(xpGained, 'Journal Entry');
        
        // Clear form
        document.getElementById('journal-entry').value = '';
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('border-blue-400', 'bg-blue-900/30');
        });
        this.selectedMood = null;
        
        this.updateHistory();
        this.checkQuestProgress('journal');
        this.addSystemMessage(`✓ Journal entry saved! +${xpGained} XP`, 'text-green-400');
    }

    // Update history displays
    updateHistory() {
        this.updateTrainingHistory();
        this.updateUrgeVictories();
        this.updateNutritionSummary();
        this.updateSleepHistory();
        this.updateJournalHistory();
    }

    // Update training history
    updateTrainingHistory() {
        const container = document.getElementById('training-history');
        if (!container) return;
        
        // Combine workouts and quick exercises
        const allExercises = [...this.data.workouts, ...this.data.quickExercises]
            .sort((a, b) => b.date - a.date)
            .slice(0, 15);
        
        if (allExercises.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center text-sm">No exercises logged yet</p>';
            return;
        }

        container.innerHTML = allExercises.map(exercise => {
            const isQuick = exercise.category === 'quick';
            const timeAgo = this.getTimeAgo(exercise.date);
            
            if (isQuick) {
                return `
                    <div class="bg-gray-800/30 rounded-lg p-2 border border-gray-700">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <i class="fas fa-bolt text-yellow-400 mr-2 text-sm"></i>
                                <div>
                                    <div class="font-semibold text-red-400 text-sm capitalize">${exercise.type.replace('-', ' ')}</div>
                                    <div class="text-xs text-gray-400">${timeAgo}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-bold text-purple-400">+${exercise.xpGained} XP</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="bg-gray-800/30 rounded-lg p-2 border border-gray-700">
                        <div class="flex justify-between items-center mb-1">
                            <div class="font-semibold text-red-400 text-sm capitalize">${exercise.type.replace('-', ' ')}</div>
                            <div class="text-xs text-gray-400">${timeAgo}</div>
                        </div>
                        <div class="text-xs text-gray-300">
                            ${exercise.sets ? `${exercise.sets} × ${exercise.reps}` : ''}
                            ${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}
                            ${exercise.duration ? ` • ${exercise.duration}min` : ''}
                            <span class="text-purple-400 ml-2">+${exercise.xpGained} XP</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // Update urge victories display
    updateUrgeVictories() {
        const container = document.getElementById('urge-victories');
        if (!container) return;
        
        if (this.data.urgeVictories.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center text-sm">No victories yet - your first battle awaits!</p>';
            return;
        }

        container.innerHTML = this.data.urgeVictories.slice(0, 10).map(victory => `
            <div class="bg-purple-900/20 rounded-lg p-2 border border-purple-500/30">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-fist-raised text-purple-400 mr-2"></i>
                        <div>
                            <div class="font-semibold text-purple-400 text-sm">Urge Defeated</div>
                            <div class="text-xs text-gray-400">${this.getTimeAgo(victory.date)}</div>
                        </div>
                    </div>
                    <div class="text-xs font-bold text-yellow-400">+25 XP</div>
                </div>
            </div>
        `).join('');
    }

    // Helper function to get time ago
    getTimeAgo(date) {
        const now = Date.now();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} min ago`;
        return 'Just now';
    }

    // Update nutrition summary
    updateNutritionSummary() {
        const summaryContainer = document.getElementById('nutrition-summary');
        const mealsContainer = document.getElementById('recent-meals');
        
        const today = new Date().toDateString();
        const todaysMeals = this.data.meals.filter(meal => 
            new Date(meal.date).toDateString() === today
        );
        
        // Summary
        const avgHealth = todaysMeals.length > 0 ? 
            (todaysMeals.reduce((sum, meal) => sum + meal.health, 0) / todaysMeals.length).toFixed(1) : 0;
        
        summaryContainer.innerHTML = `
            <div class="bg-gray-800/30 rounded-lg p-3">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="text-gray-400">Meals Today</div>
                        <div class="font-bold text-yellow-400">${todaysMeals.length}</div>
                    </div>
                    <div>
                        <div class="text-gray-400">Avg Health</div>
                        <div class="font-bold text-yellow-400">${avgHealth}/10</div>
                    </div>
                </div>
            </div>
        `;
        
        // Recent meals
        const recentMeals = this.data.meals.slice(0, 5);
        if (recentMeals.length === 0) {
            mealsContainer.innerHTML = '<p class="text-gray-500 text-center text-sm">No meals logged yet</p>';
            return;
        }

        mealsContainer.innerHTML = recentMeals.map(meal => `
            <div class="bg-gray-800/30 rounded-lg p-2 border border-gray-700">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-semibold text-yellow-400 text-sm">${meal.type}</span>
                    <span class="text-xs text-gray-400">${new Date(meal.date).toLocaleDateString()}</span>
                </div>
                <div class="text-xs text-gray-300">${meal.items}</div>
                <div class="text-xs text-gray-400">Health: ${meal.health}/10 • ${meal.portion}</div>
            </div>
        `).join('');
    }

    // Update sleep history
    updateSleepHistory() {
        const container = document.getElementById('sleep-history');
        const recentSleep = this.data.sleepLogs.slice(0, 7);
        
        if (recentSleep.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No sleep logs yet</p>';
            return;
        }

        container.innerHTML = recentSleep.map(sleep => `
            <div class="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-purple-400">${sleep.duration.toFixed(1)}h sleep</span>
                    <span class="text-xs text-gray-400">${new Date(sleep.date).toLocaleDateString()}</span>
                </div>
                <div class="text-sm text-gray-300">
                    ${sleep.bedtime} → ${sleep.waketime} • Quality: ${sleep.quality}/10
                </div>
                ${sleep.notes ? `<div class="text-xs text-gray-400 mt-1">${sleep.notes}</div>` : ''}
            </div>
        `).join('');
        
        // Update averages
        const avgDuration = recentSleep.reduce((sum, sleep) => sum + sleep.duration, 0) / recentSleep.length;
        const avgQuality = recentSleep.reduce((sum, sleep) => sum + sleep.quality, 0) / recentSleep.length;
        
        document.getElementById('avg-sleep-duration').textContent = `${avgDuration.toFixed(1)} hours`;
        document.getElementById('avg-sleep-quality').textContent = `${avgQuality.toFixed(1)}/10`;
    }

    // Update journal history
    updateJournalHistory() {
        const container = document.getElementById('journal-history');
        const recentEntries = this.data.journalEntries.slice(0, 5);
        
        if (recentEntries.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No journal entries yet</p>';
            return;
        }

        const moodEmojis = ['', '😢', '😔', '😐', '🙂', '😊'];

        container.innerHTML = recentEntries.map(entry => `
            <div class="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-2xl">${moodEmojis[entry.mood]}</span>
                    <span class="text-xs text-gray-400">${new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <p class="text-sm text-gray-300">${entry.text.length > 100 ? entry.text.substring(0, 100) + '...' : entry.text}</p>
            </div>
        `).join('');
    }

    // Generate daily quests
    generateDailyQuests() {
        const today = new Date().toDateString();
        
        if (this.data.lastQuestGeneration === today) {
            this.updateQuests();
            return;
        }

        this.data.lastQuestGeneration = today;
        
        const questTemplates = [
            { id: 'workout', title: 'Complete any exercise', xp: 20, type: 'workout' },
            { id: 'defeat-urge', title: 'Defeat an urge', xp: 30, type: 'urge-defeat' },
            { id: 'pushups', title: 'Do push-ups', xp: 15, type: 'pushups' },
            { id: 'cardio', title: 'Do cardio exercise', xp: 25, type: 'cardio' },
            { id: 'abs-workout', title: 'Work on your abs', xp: 20, type: 'abs' },
            { id: 'healthy-meal', title: 'Eat a healthy meal (8+ health)', xp: 15, type: 'meal' },
            { id: 'journal', title: 'Write in your journal', xp: 20, type: 'journal' },
            { id: 'meditation', title: 'Meditate for 10 minutes', xp: 15, type: 'meditation' },
            { id: 'sleep-log', title: 'Log your sleep quality', xp: 10, type: 'sleep' },
            { id: 'clean-day', title: 'Stay disciplined for another day', xp: 15, type: 'clean' },
            { id: 'emergency-tool', title: 'Use an emergency tool when needed', xp: 20, type: 'emergency' }
        ];

        // Generate 3-4 random daily quests
        const numQuests = Math.floor(Math.random() * 2) + 3;
        const selectedQuests = questTemplates
            .sort(() => Math.random() - 0.5)
            .slice(0, numQuests)
            .map(quest => ({
                ...quest,
                id: `daily-${Date.now()}-${quest.id}`,
                completed: false,
                progress: 0,
                target: 1
            }));

        this.data.dailyQuests = selectedQuests;
        this.saveData();
        this.updateQuests();
    }

    // Update quest displays
    updateQuests() {
        this.updateDailyQuests();
        this.updateActiveQuestsPreview();
    }

    // Update daily quests display
    updateDailyQuests() {
        const container = document.getElementById('daily-quests');
        
        if (this.data.dailyQuests.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No daily quests available</p>';
            return;
        }

        container.innerHTML = this.data.dailyQuests.map(quest => `
            <div class="quest-item ${quest.completed ? 'quest-complete' : ''} bg-gray-800/30 rounded-lg p-3 border ${quest.completed ? 'border-green-500' : 'border-gray-700'}">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold ${quest.completed ? 'text-green-400' : 'text-white'}">${quest.title}</span>
                    <span class="text-xs ${quest.completed ? 'text-green-400' : 'text-yellow-400'}">+${quest.xp} XP</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-400">Progress: ${quest.progress}/${quest.target}</div>
                    ${quest.completed ? '<i class="fas fa-check text-green-400"></i>' : '<i class="fas fa-clock text-gray-400"></i>'}
                </div>
            </div>
        `).join('');
    }

    // Update active quests preview
    updateActiveQuestsPreview() {
        const container = document.getElementById('active-quests-preview');
        const activeQuests = this.data.dailyQuests.filter(quest => !quest.completed).slice(0, 3);
        
        if (activeQuests.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center text-xs">All quests completed!</p>';
            return;
        }

        container.innerHTML = activeQuests.map(quest => `
            <div class="text-xs text-gray-300 flex justify-between">
                <span>${quest.title}</span>
                <span class="text-purple-400">+${quest.xp}</span>
            </div>
        `).join('');
    }

    // Check quest progress
    checkQuestProgress(actionType, value = 1) {
        this.data.dailyQuests.forEach(quest => {
            if (quest.completed) return;
            
            // Check for exact matches or related types
            let matchesQuest = false;
            
            if (quest.type === actionType) {
                matchesQuest = true;
            } else if (actionType === 'workout' && ['pushups', 'cardio', 'abs'].includes(quest.type)) {
                matchesQuest = true;
            } else if (actionType === 'pushups' && quest.type === 'workout') {
                matchesQuest = true;
            } else if (actionType === 'cardio' && quest.type === 'workout') {
                matchesQuest = true;
            } else if (actionType === 'abs' && quest.type === 'workout') {
                matchesQuest = true;
            }
            
            if (matchesQuest) {
                quest.progress += value;
                
                if (quest.progress >= quest.target) {
                    quest.completed = true;
                    this.addXP(quest.xp, `Quest: ${quest.title}`);
                    this.addSystemMessage(`🎯 Quest completed: ${quest.title}`, 'text-green-400');
                }
            }
        });
        
        // Special quest for clean days
        if (actionType === 'clean') {
            const cleanQuest = this.data.dailyQuests.find(q => q.type === 'clean' && !q.completed);
            if (cleanQuest) {
                cleanQuest.completed = true;
                this.addXP(cleanQuest.xp, `Quest: ${cleanQuest.title}`);
            }
        }
        
        this.updateQuests();
        this.saveData();
    }

    // Update stats display
    updateStats() {
        document.getElementById('stat-strength').textContent = this.data.strength;
        document.getElementById('stat-intelligence').textContent = this.data.intelligence;
        document.getElementById('stat-endurance').textContent = this.data.endurance;
        document.getElementById('stat-wisdom').textContent = this.data.wisdom;
        
        document.getElementById('total-xp-earned').textContent = this.data.totalXP;
        document.getElementById('current-level-display').textContent = this.data.level;
        
        const daysActive = Math.floor((Date.now() - this.data.systemStartDate) / (1000 * 60 * 60 * 24));
        document.getElementById('days-active').textContent = daysActive;
    }

    // Initialize system messages
    initializeSystemMessages() {
        const container = document.getElementById('system-messages');
        if (container && container.children.length === 0) {
            container.innerHTML = `
                <div class="text-green-400 text-sm">✓ System initialized successfully</div>
                <div class="text-blue-400 text-sm">ℹ Welcome, Hunter. Your journey begins now.</div>
            `;
        }
    }

    // Add system message
    addSystemMessage(message, className = 'text-blue-400') {
        const container = document.getElementById('system-messages');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `text-sm ${className}`;
        messageDiv.textContent = message;
        
        container.insertBefore(messageDiv, container.firstChild);
        
        // Keep only last 5 messages
        while (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }

    // Check skill unlocks
    checkSkillUnlocks() {
        const skillRequirements = {
            'advanced-discipline': { level: 5, skills: ['basic-discipline'] },
            'master-discipline': { level: 10, skills: ['advanced-discipline'] },
            'strength-training': { level: 3, skills: ['basic-fitness'] },
            'endurance-training': { level: 3, skills: ['basic-fitness'] },
            'meal-planning': { level: 4, skills: ['basic-nutrition'] },
            'advanced-nutrition': { level: 8, skills: ['meal-planning'] },
            'breathing-mastery': { level: 3, skills: ['basic-meditation'] },
            'zen-master': { level: 12, skills: ['breathing-mastery'] }
        };

        Object.entries(skillRequirements).forEach(([skill, req]) => {
            if (!this.data.unlockedSkills.includes(skill) && 
                this.data.level >= req.level &&
                req.skills.every(s => this.data.unlockedSkills.includes(s))) {
                
                this.data.unlockedSkills.push(skill);
                this.addSystemMessage(`🌟 New skill unlocked: ${skill.replace('-', ' ')}`, 'text-yellow-400');
            }
        });
    }

    // Initialize charts
    initializeCharts() {
        const progressCtx = document.getElementById('progress-chart');
        if (progressCtx) {
            this.charts.progress = new Chart(progressCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Level',
                            data: [],
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'XP Gained',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff',
                                font: {
                                    size: window.innerWidth > 1024 ? 14 : 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#ffffff',
                            bodyColor: '#cbd5e1',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8,
                            titleFont: {
                                size: window.innerWidth > 1024 ? 14 : 12
                            },
                            bodyFont: {
                                size: window.innerWidth > 1024 ? 13 : 11
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                color: '#ffffff',
                                font: {
                                    size: window.innerWidth > 1024 ? 12 : 10
                                }
                            },
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            }
                        },
                        y: {
                            ticks: { 
                                color: '#ffffff',
                                font: {
                                    size: window.innerWidth > 1024 ? 12 : 10
                                }
                            },
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: window.innerWidth > 1024 ? 4 : 3,
                            hoverRadius: window.innerWidth > 1024 ? 6 : 4
                        },
                        line: {
                            borderWidth: window.innerWidth > 1024 ? 3 : 2
                        }
                    }
                }
            });
        }
        
        this.updateCharts();
    }

    // Update charts
    updateCharts() {
        if (this.charts.progress) {
            // Generate sample data for last 7 days
            const labels = [];
            const levelData = [];
            const xpData = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString());
                
                // Simulate progression (in real app, track this data)
                levelData.push(Math.max(1, this.data.level - i));
                xpData.push(Math.floor(Math.random() * 50) + 10);
            }
            
            this.charts.progress.data.labels = labels;
            this.charts.progress.data.datasets[0].data = levelData;
            this.charts.progress.data.datasets[1].data = xpData;
            this.charts.progress.update();
        }
    }

    // Style quick action buttons
    styleQuickActionButtons() {
        const style = document.createElement('style');
        style.textContent = `
            .quick-action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0.75rem;
                background: linear-gradient(135deg, rgba(55, 65, 81, 0.5) 0%, rgba(31, 41, 55, 0.5) 100%);
                border: 1px solid rgba(75, 85, 99, 0.5);
                border-radius: 0.5rem;
                color: white;
                transition: all 0.3s ease;
                cursor: pointer;
                min-height: 60px;
            }
            .quick-action-btn:hover {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%);
                border-color: rgba(59, 130, 246, 0.5);
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
            }
            .tab-btn {
                padding: 0.5rem 1rem;
                background: rgba(55, 65, 81, 0.5);
                border: 1px solid rgba(75, 85, 99, 0.5);
                border-radius: 0.5rem;
                color: #9ca3af;
                transition: all 0.3s ease;
                cursor: pointer;
                font-weight: 500;
            }
            .tab-btn:hover:not(.active) {
                color: white;
                background: rgba(75, 85, 99, 0.5);
            }
            .tab-btn.active {
                background: #2563eb;
                color: white;
                border-color: #2563eb;
                box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
}

// Global helper functions
window.switchTab = (tabName) => window.lifeSystem.switchTab(tabName);

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lifeSystem = new LifeSystem();
    window.lifeSystem.styleQuickActionButtons();
    
    // Mark clean day quest as completed automatically
    setTimeout(() => {
        window.lifeSystem.checkQuestProgress('clean');
    }, 1000);
});