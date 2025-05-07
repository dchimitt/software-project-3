import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField, Button, MenuItem, Select, InputLabel, FormControl, Card, CardActions, CardContent, // Added CardActions
    Typography, Grid, Snackbar, Alert, IconButton, AppBar, Toolbar, Switch, Collapse, Dialog,
    DialogTitle, DialogContent, DialogActions, Fab, List, ListItem, ListItemText,
    ListItemSecondaryAction, Divider
} from '@mui/material';
import { DirectionsCar, EventAvailable, AddCircle, Map, Brightness4, Brightness7 } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';


function App() {
    // --- State Variables ---
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [mapUrl, setMapUrl] = useState('');
    const [parkingSuggestion, setParkingSuggestion] = useState(''); // <-- Parking Suggestion State
    const [destination, setDestination] = useState('Purdue University Northwest');
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [selectedRegisteredEvent, setSelectedRegisteredEvent] = useState('');
    const [searchStudentID, setSearchStudentID] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Removed filteredEvents definition from here, moved below functions

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false); // <-- ADDED state for Details modal
    const [showRegisterDialog, setShowRegisterDialog] = useState(false); // <-- ADDED state for Register modal


    const [studentInfo, setStudentInfo] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        studentID: ''
    });

    const [newEvent, setNewEvent] = useState({
        event_name: '',
        abstract: '',
        event_date: '',
        location: '',
        cost: '',
        time_from: '',
        time_to: ''
    });

// --- REVISED Parking Data and Helper Function ---
    const parkingMappings = {
        // --- ADD PARKING LOTS AS LOCATIONS ---
        'parking lot 1': 'Event is in Lot 1. Nearby options: Parking Garage, Lot 5.',
        'parking lot 2': 'Event is in Lot 2. Nearby options: Parking Garage, Lot 8, Lot 9.',
        'parking lot 3': 'Event is in Lot 3. Nearby options: Lot 1, Lot 5, Parking Garage.',
        'parking lot 4': 'Event is in Lot 4 (West side). Nearby options: Lot 5.', // Small lot
        'parking lot 5': 'Event is in Lot 5. Nearby options: Lot 1, Lot 3, Parking Garage.',
        'parking lot 6': 'Event is in Lot 6. Nearby options: Parking Garage, Lot 7.', // User's case
        'parking lot 7': 'Event is in Lot 7. Nearby options: Lot 6, Lot 16 (near Schneider).',
        'parking lot 8': 'Event is in Lot 8. Nearby options: Parking Garage, Lot 2, Lot 9.',
        'parking lot 9': 'Event is in Lot 9. Nearby options: Parking Garage, Lot 2, Lot 8.',
        'parking lot 10': 'Event is in Lot 10. Nearby options: Lot 11, Parking Garage.',
        'parking lot 11': 'Event is in Lot 11. Nearby options: Lot 10, Parking Garage.',
        'parking lot 12': 'Event is in Lot 12 (South Campus). Nearby options: Lot 13, Lot 14.',
        'parking lot 13': 'Event is in Lot 13 (Main South Lot). Nearby options: Lot 12, Lot 14.',
        'parking lot 14': 'Event is in Lot 14 (South Campus). Nearby options: Lot 13, Lot 12.',
        'parking lot 15': 'Event is in Lot 15 (Southwest). Nearby options: Lot 12, Lot 14.',
        'parking lot 16': 'Event is in Lot 16 (Northeast). Nearby options: Lot 7.',
        'parking garage': 'Event is in the Parking Garage. Check for specific levels/areas.', // Garage itself

        // Hammond Campus - Based on Hammond-Map-Lage.png
        'anderson': 'Parking Garage, Lot 1, Lot 5', // West side, North
        'classroom office': 'Parking Garage, Lot 1, Lot 5', // West side, North
        'cob': 'Parking Garage, Lot 1, Lot 5', // West side, North
        'potter': 'Parking Garage, Lot 1, Lot 5', // West side, North-Mid
        'powers': 'Parking Garage, Lot 1, Lot 3, Lot 5', // West side, Mid
        'gyte': 'Parking Garage, Lot 1, Lot 3, Lot 5', // West side, Mid-South
        'lawshe': 'Parking Garage, Lot 10, Lot 11', // Southwest academic area
        'student union': 'Parking Garage, Lot 2, Lot 8, Lot 9', // Central academic area
        'library': 'Parking Garage, Lot 2, Lot 8, Lot 9', // Central academic area
        'sulb': 'Parking Garage, Lot 2, Lot 8, Lot 9', // Central academic area
        'nils k nelson': 'Parking Garage, Lot 8, Lot 9', // South of SULB
        'bioscience': 'Parking Garage, Lot 8, Lot 9', // South of SULB
        'porter': 'Parking Garage, Lot 2', // East of SULB
        'design studio': 'Parking Garage, Lot 1', // North area, near 169th
        'university services': 'Parking Garage, Lot 1', // North area, near 169th
        'schneider': 'Lot 16, Lot 7', // Northeast corner
        'police': 'Lot 16, Lot 7 (Near Schneider Ave Bldg)', // Assumed near Schneider
        'fitness': 'Lot 13, Lot 14, Lot 12 (South of 173rd)', // South Campus
        'recreation': 'Lot 13, Lot 14, Lot 12 (South of 173rd)', // South Campus
        'peregrine': 'Lot 13 (Main South Lot)', // University Village Housing
        'griffin': 'Lot 13 (Main South Lot)', // University Village Housing
        'university village': 'Lot 13 (Main South Lot)', // University Village Housing
        'counseling': 'Lot 15', // Southwest area
        'healthy living': 'Lot 15', // Southwest area
        'white lodging': 'Lot 14, Lot 13', // Southwest area
        'hospitality': 'Lot 14, Lot 13', // Keyword for White Lodging
        'challenger': 'Lot 14, Lot 13', // Keyword for White Lodging location

        // Off-map buildings mentioned previously - keep general suggestions from search results
        'dowling park': 'Dowling Park Athletics Complex Parking',
        'athletics': 'Dowling Park Athletics Complex Parking',
        'roberts center': 'Parking near Roberts Center (7040 Indianapolis Blvd)',
        'cmec': 'Parking near CMEC (7150 Indianapolis Blvd)',

        // Hammond General Catch-all - Garage is central, but check map link too
        'hammond': 'Parking Garage or check map for lot near specific building',

        // --- Westville Campus Keywords -> Suggestions (Keep previous or refine if Westville map provided) ---
        'schwarz': 'Lots North or East of Schwarz Hall (Check Westville map)',
        'technology': 'Lots East of Technology Building (Check Westville map)',
        'tech building': 'Lots East of Technology Building (Check Westville map)',
        'library student faculty': 'Lots North of LSF (Check Westville map)',
        'lsf': 'Lots North of LSF (Check Westville map)',
        'dworkin': 'Lots East or South of DSAC (Check Westville map)',
        'dsac': 'Lots East or South of DSAC (Check Westville map)',
        'student services': 'Lots East or South of DSAC (Check Westville map)',
        'westville': 'Check Westville campus map for lots near specific building',

        // Default if no match
        'default': 'Please check official PNW Campus Maps for specific parking.'
    };

    // The getParkingSuggestion function remains the same as before
    const getParkingSuggestion = (locationString) => {
        if (!locationString) {
            return parkingMappings['default'];
        }
        const lowerLocation = locationString.toLowerCase();

        const specificKeys = Object.keys(parkingMappings).filter(k => k !== 'hammond' && k !== 'westville' && k !== 'default');
        for (const key of specificKeys) {
            if (lowerLocation.includes(key)) {
                return parkingMappings[key];
            }
        }

        if (lowerLocation.includes('hammond')) {
            return parkingMappings['hammond'];
        }
        if (lowerLocation.includes('westville')) {
            return parkingMappings['westville'];
        }

        return parkingMappings['default'];
    };
    // --- End REVISED Parking Data and Function ---

    // --- Effects ---
    useEffect(() => { fetchEvents(); }, []);

    // --- ADDED: useEffect for debounced fetching of registered events ---
    useEffect(() => {
        // Don't fetch if ID is empty or too short (optional, adjust min length if needed)
        if (!searchStudentID || searchStudentID.trim().length < 3) {
            setRegisteredEvents([]); // Clear previous results if ID becomes too short
            return;
        }

        // Set a timer to fetch events after a short delay
        const debounceTimer = setTimeout(() => {
            fetchRegisteredEvents();
        }, 750); // Adjust delay as needed (750ms)

        // Cleanup function: Clear the timer if the user types again before delay finishes
        return () => {
            clearTimeout(debounceTimer);
        };

    }, [searchStudentID]); // Dependency array: Re-run effect only when searchStudentID changes
    // Note: If fetchRegisteredEvents used other state/props, it might need to be included or memoized


    // --- Data Fetching ---
    const fetchEvents = () => {
        axios.get('http://localhost:5000/events')
            .then(response => setEvents(response.data))
            .catch(error => console.error('Error fetching events', error));
    };

    // MODIFIED fetchRegisteredEvents for automatic loading
    const fetchRegisteredEvents = () => {
        // This function now gets called by the useEffect, but the check inside is still important
        if (!searchStudentID) {
            // This check might be redundant now due to useEffect check, but harmless
            // setSnackbar({ open: true, message: 'Please enter your Student ID first.', severity: 'warning' });
            return;
        }

        // Add a loading indicator maybe?
        setSnackbar({ open: true, message: `Loading events for ${searchStudentID}...`, severity: 'info', autoHideDuration: 1500 });


        axios.get(`http://localhost:5000/my-registrations/${searchStudentID}`)
            .then(response => {
                setRegisteredEvents(response.data);
                if (response.data.length === 0) {
                    setSnackbar({ open: true, message: 'No registered events found for this ID.', severity: 'info' });
                }
                // Don't automatically select an event anymore
                // if (response.data.length > 0) {
                //     setSelectedRegisteredEvent(response.data[0].id.toString());
                // }
            })
            .catch(error => {
                console.error('Error fetching registered events', error);
                setRegisteredEvents([]); // Clear results on error
                setSnackbar({ open: true, message: 'Could not fetch registered events.', severity: 'error' });
            });
    };


    // --- Event Handlers ---
    const handleRegister = () => { // MODIFIED for Dialog
        if (!selectedEventId || !studentInfo.studentID || !studentInfo.firstName || !studentInfo.lastName) {
            setSnackbar({ open: true, message: 'Please select an event and fill in required student information (First Name, Last Name, Student ID).', severity: 'warning' });
            return;
        }

        axios.post('http://localhost:5000/register', { ...studentInfo, eventID: selectedEventId })
            .then(response => {
                setSnackbar({ open: true, message: response.data.message || 'Registration successful!', severity: 'success' });
                // Clear form and close registration section
                setShowRegisterDialog(false); // <-- Close the register modal
                setStudentInfo({ firstName: '', middleName: '', lastName: '', studentID: '' });
                // Clear selected event info related to registration
                setSelectedEventId('');
                // Optionally keep selectedEvent for potential other uses, or clear it too if desired
                // setSelectedEvent(null);
                setParkingSuggestion(''); // Clear suggestion
            })
            .catch(error => {
                console.error('Error registering student', error);
                const message = error.response?.data?.message || 'Registration failed. Please try again.';
                setSnackbar({ open: true, message: message, severity: 'error' });
            });
    };

    const handleAddEvent = () => {
        // Basic validation for new event
        if (!newEvent.event_name || !newEvent.event_date || !newEvent.location || !newEvent.time_from || !newEvent.time_to) {
            setSnackbar({ open: true, message: 'Please fill in all required event fields (Name, Date, Location, Times).', severity: 'warning' });
            return;
        }

        axios.post('http://localhost:5000/add-event', newEvent)
            .then(response => {
                setSnackbar({ open: true, message: response.data.message || 'Event added successfully!', severity: 'success' });
                setNewEvent({ event_name: '', abstract: '', event_date: '', location: '', cost: '', time_from: '', time_to: '' }); // Clear form
                setShowAddDialog(false); // Close dialog
                fetchEvents(); // Refresh event list
            })
            .catch(error => {
                console.error('Error adding event', error);
                const message = error.response?.data?.message || 'Adding event failed. Please try again.';
                setSnackbar({ open: true, message: message, severity: 'error' });
            });
    };

    // Handles the SELECT dropdown inside the old registration form - NO LONGER USED directly for triggering parking suggestions
    const handleEventSelect = (e) => {
        const selectedId = e.target.value;
        setSelectedEventId(selectedId);
        const event = events.find(ev => ev.id.toString() === selectedId);
        setSelectedEvent(event); // Update the selected event context if needed

        // Parking suggestion is now handled by button clicks opening modals
        if (event) {
            setDestination(event.location || 'Purdue University Northwest');
            // setParkingSuggestion(getParkingSuggestion(event.location)); // REMOVED - handled by modal triggers
        } else {
            setParkingSuggestion('');
        }
    };

    const handleGetDirections = (eventLocation) => {
        const dest = eventLocation || 'Purdue University Northwest, Hammond, IN'; // Default destination

        if (!navigator.geolocation) {
            setSnackbar({ open: true, message: 'Geolocation is not supported by your browser.', severity: 'warning' });
            return;
        }

        setSnackbar({ open: true, message: 'Getting your location...', severity: 'info', autoHideDuration: 2000 });
        // Ensure map is hidden initially while loading new one - Not hiding the main page one now
        // setShowMap(false); // We don't control the main page map anymore
        setMapUrl(''); // Clear previous URL

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const origin = `${latitude},${longitude}`;

                // --- Use Google Maps Embed API for iframe ---
                // ** Replace YOUR_API_KEY with your actual Google Maps API Key **
                const apiKey = 'AIzaSyBmqoQsHVyJmQDMQESdPQto7rSRqnGCM8A'; // <-- User Provided Key
                console.log("Checking API Key. Value is:", apiKey);
                // Add a more robust check, ensure it's not placeholder or empty
                if (!apiKey || apiKey.trim() === '') {
                    setSnackbar({ open: true, message: 'API Key missing or invalid for embedded map.', severity: 'error' });
                    console.error("API Key for Google Maps Embed API is missing or invalid!");
                    return; // Stop if no valid API key
                }

                // Construct the Embed API URL for directions
                const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBmqoQsHVyJmQDMQESdPQto7rSRqnGCM8A&origin=${origin}&destination=${encodeURIComponent(destination)};`; // <-- Corrected ${apiKey}                console.log("Using Embed URL:", embedUrl);

                setMapUrl(embedUrl); // Set the URL for the iframe
                setShowMap(true);   // Set state to show the Collapse containing the iframe (now inside the modal)
                setSnackbar({ open: true, message: 'Directions loading...', severity: 'info', autoHideDuration: 1500 }); // Info while loading map
                // --- End Embed API Logic ---

            },
            (error) => {
                console.error('Error getting location:', error);
                let message = 'Unable to retrieve your location. Please ensure location services are enabled.';
                if (error.code === 1) { // PERMISSION_DENIED
                    message = 'Location permission denied. Please enable it in your browser settings.';
                }
                setSnackbar({ open: true, message: message, severity: 'error' });
                setShowMap(false); // Keep map hidden on error
                setMapUrl('');
            }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBD';
        try {
            // Adding timeZone option to help consistency
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Invalid Date";
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            // Attempt to parse time, assuming HH:MM or HH:MM:SS format
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes || 0, 10), 0);
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch (e) {
            console.error("Error formatting time:", timeString, e);
            return timeString; // Return original string if formatting fails
        }
    };


    const toggleTheme = () => setDarkMode(!darkMode);

    // --- Filtering (defined after functions) ---
    const filteredEvents = events.filter(event =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) // Also search location
    );

    // --- Render ---
    return (
        // Apply dark mode styles directly if not using ThemeProvider
        <div style={{ padding: 30, backgroundColor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh', color: darkMode ? '#ffffff' : '#000000' }}>
            {/* --- App Bar --- */}
            <AppBar position="static" sx={{ backgroundColor: darkMode ? '#272727' : 'primary.main' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>PNW Student Life Portal</Typography>
                    <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle dark mode">
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* --- Main Content Grid --- */}
            <Grid container spacing={4} marginTop={3}>

                {/* --- Event Search and Display --- */}
                <Grid item xs={12}>
                    <TextField
                        label="Search events by name or location"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            mb: 2,
                            // Style for dark mode
                            input: { color: darkMode ? '#fff' : '#000' },
                            label: { color: darkMode ? '#aaa' : 'inherit' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' },
                                '&:hover fieldset': { borderColor: darkMode ? '#888' : 'rgba(0, 0, 0, 0.87)' },
                                '&.Mui-focused fieldset': { borderColor: darkMode ? 'primary.light' : 'primary.main' },
                            },
                        }}
                    />
                    <Grid container spacing={3}>
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <Grid item xs={12} sm={6} md={4} key={event.id}>
                                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#333' : '#fff', borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.12)' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#eee' : 'inherit' }}>{event.event_name}</Typography>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: darkMode ? '#ccc' : 'text.secondary' }}>
                                                <EventAvailable sx={{ mr: 1, fontSize: '1.1rem' }} />
                                                {formatDate(event.event_date)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: darkMode ? '#ccc' : 'text.secondary' }}>
                                                <EventAvailable sx={{ mr: 1, fontSize: '1.1rem', opacity: 0 }} /> {/* Placeholder for alignment */}
                                                {formatTime(event.time_from)}
                                                {event.time_to && ` to ${formatTime(event.time_to)}`}
                                            </Typography>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: darkMode ? '#ccc' : 'text.secondary' }}>
                                                <Map sx={{ mr: 1, fontSize: '1.1rem' }} /> {event.location || 'Location TBD'}
                                            </Typography>
                                        </CardContent>
                                        {/* --- MODIFIED CardActions --- */}
                                        <CardActions sx={{ justifyContent: 'space-between', pr: 1, pb: 1, pl: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedEvent(event); // Set the event for the details modal
                                                    setParkingSuggestion(getParkingSuggestion(event.location)); // Pre-calculate parking
                                                    setShowDetailsDialog(true); // Open details modal
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedEvent(event); // Set the event for the register modal
                                                    setSelectedEventId(event.id.toString()); // Set ID needed for registration
                                                    // Optionally prefill student ID if already entered for registered events
                                                    if (searchStudentID) {
                                                        setStudentInfo(prev => ({ ...prev, studentID: searchStudentID }));
                                                    }
                                                    setShowRegisterDialog(true); // Open register modal
                                                }}
                                            >
                                                Register
                                            </Button>
                                        </CardActions>
                                        {/* --- End MODIFIED CardActions --- */}
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography sx={{ textAlign: 'center', mt: 3, color: darkMode ? '#aaa' : 'text.secondary' }}>
                                    No events match your search criteria.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                {/* --- REMOVED Registration Form Collapse Section --- */}


                {/* --- Registered Events Section (MODIFIED - Button Removed) --- */}
                <Grid item xs={12}>
                    <Card sx={{ backgroundColor: darkMode ? '#333' : '#fff', borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.12)' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: darkMode ? '#eee' : 'inherit' }}>
                                <DirectionsCar sx={{ mr: 1 }} /> Your Registered Events
                            </Typography>
                            <TextField
                                label="Enter Your Student ID to View"
                                fullWidth
                                margin="normal"
                                value={searchStudentID}
                                onChange={e => setSearchStudentID(e.target.value)} // Input triggers useEffect
                                // Dark mode styling
                                InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }}
                                inputProps={{ style: { color: darkMode ? '#fff' : undefined } }}
                                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}
                            />

                            {registeredEvents.length >= 0 ? (
                                <List sx={{
                                    pt: 0, // Keep existing padding top removal
                                    maxHeight: '400px', // <-- Set desired max height (adjust value as needed)
                                    overflowY: 'auto',  // <-- Add scrollbar if content exceeds maxHeight
                                    pr: 1 // Add some padding to the right to prevent text hitting scrollbar
                                }}> {/* Remove top padding on list */}
                                    {registeredEvents.map((event, index) => (
                                        <React.Fragment key={event.id}>
                                            <ListItem
                                                secondaryAction={ // Use secondaryAction prop for button placement
                                                    <IconButton
                                                        edge="end" // Helps with alignment
                                                        aria-label={`Get directions for ${event.event_name}`}
                                                        onClick={() => handleGetDirections(event.location)}
                                                        color="secondary" // Or "primary" based on your theme preference
                                                    >
                                                        <Map /> {/* Just the Map Icon */}
                                                    </IconButton>
                                                }
                                                // Add padding adjust if needed
                                                sx={{ pt:1, pb: 1}}
                                            >
                                                <ListItemText
                                                    primary={event.event_name}
                                                    secondary={`${formatDate(event.event_date)} at ${event.location || 'TBD'}`}
                                                    primaryTypographyProps={{ color: darkMode ? '#fff' : 'inherit' }} // Add padding right
                                                    secondaryTypographyProps={{ color: darkMode ? '#ccc' : 'text.secondary' }} // Add padding right
                                                />
                                            </ListItem>
                                            {index < registeredEvents.length - 1 && <Divider component="li" sx={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                // Show message only *after* attempting to load (indicated by searchStudentID having value)
                                searchStudentID && registeredEvents.length === 0 && (
                                    <Typography sx={{ textAlign: 'center', mt: 2, color: darkMode ? '#aaa' : 'text.secondary' }}>
                                        No registered events found for this Student ID, or events are loading...
                                    </Typography>
                                )
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* --- REMOVED Map Display Collapse Section from Main Page --- */}

            </Grid>

            {/* --- View Event Details Dialog (Map Inside) --- */}
            <Dialog
                open={showDetailsDialog}
                // Reset map state when dialog closes
                onClose={() => {
                    setShowDetailsDialog(false);
                    setShowMap(false); // <-- Hide map when closing
                    setMapUrl('');     // <-- Clear map URL when closing
                }}
                fullWidth
                maxWidth="md" // <-- Changed to medium for more map space
                PaperProps={{ sx: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' } }}
            >
                {selectedEvent && ( // Render only if an event is selected
                    <>
                        <DialogTitle sx={{ color: darkMode ? '#eee' : 'inherit' }}>
                            {selectedEvent.event_name}
                        </DialogTitle>
                        <DialogContent dividers> {/* Use dividers for better content separation */}
                            {/* Event Info */}
                            <Typography gutterBottom sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}>
                                <EventAvailable sx={{ fontSize: '1.1rem', verticalAlign: 'bottom', mr: 0.5 }} />
                                {formatDate(selectedEvent.event_date)} from {formatTime(selectedEvent.time_from)} to {formatTime(selectedEvent.time_to)}
                            </Typography>
                            <Typography gutterBottom sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}>
                                <Map sx={{ fontSize: '1.1rem', verticalAlign: 'bottom', mr: 0.5 }} />
                                Location: {selectedEvent.location || 'TBD'}
                            </Typography>

                            {/* Abstract/Description */}
                            {selectedEvent.abstract && (
                                <Typography variant="body2" paragraph sx={{ mt: 2, color: darkMode ? '#ddd' : 'text.primary' }}>
                                    {selectedEvent.abstract}
                                </Typography>
                            )}

                            {/* Parking Suggestion */}
                            {parkingSuggestion && (
                                <Typography variant="body2" sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: darkMode ? 'grey.700' : 'grey.300', borderRadius: 1, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'grey.100', color: darkMode ? '#eee' : 'inherit' }}>
                                    <span style={{ fontWeight: 'bold' }}>Suggested Parking:</span> {parkingSuggestion}
                                    <br />
                                    <em style={{ fontSize: '0.9em', color: darkMode ? '#bbb' : 'text.secondary' }}>(Always check posted signs)</em>
                                </Typography>
                            )}

                            {/* Get Directions Button */}
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Map />}
                                onClick={() => {
                                    // Call the existing function which sets mapUrl and showMap
                                    handleGetDirections(selectedEvent.location);
                                }}
                                sx={{ mt: 2 }}
                            >
                                Get Directions
                            </Button>

                            {/* --- Map Display Collapse Section (MOVED INSIDE DIALOG) --- */}
                            <Collapse in={showMap} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
                                {mapUrl ? ( // Render iframe only if mapUrl is set
                                    <div> {/* Simple div container */}
                                        <Typography variant="h6" sx={{ mb: 1, color: darkMode ? '#eee' : 'inherit' }}>Driving Directions</Typography>
                                        <iframe
                                            src={mapUrl} // Ensure this uses Embed API URL + your Key if using iframe
                                            width="100%"
                                            height="400" // Adjusted height slightly for modal
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Directions Map"
                                        ></iframe>
                                    </div>
                                ) : (
                                    // Optional: show a loading indicator while mapUrl is being fetched
                                    <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>Loading map...</Typography>
                                )}
                            </Collapse>
                            {/* --- End Map Display Collapse Section --- */}

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                setShowDetailsDialog(false);
                                setShowMap(false); // Hide map when closing
                                setMapUrl(''); // Clear map URL when closing
                            }}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            {/* --- End View Event Details Dialog --- */}


            {/* --- Register for Event Dialog (Remains the same) --- */}
            <Dialog
                open={showRegisterDialog}
                onClose={() => {
                    setShowRegisterDialog(false);
                    // Clear student info when closing dialog manually
                    setStudentInfo({ firstName: '', middleName: '', lastName: '', studentID: '' });
                }}
                fullWidth
                maxWidth="xs" // Make register dialog slightly smaller maybe
                PaperProps={{ sx: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' } }}
            >
                {selectedEvent && ( // Render only if an event is selected
                    <>
                        <DialogTitle sx={{ color: darkMode ? '#eee' : 'inherit', pb: 1 }}> {/* Reduced padding bottom */}
                            Register for:
                            <Typography variant="h6" component="div" sx={{ color: darkMode ? '#fff' : 'primary.main' }}>
                                {selectedEvent.event_name}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            {/* Student Info TextFields (copied from previous Collapse) */}
                            <TextField label="First Name" required fullWidth margin="normal" value={studentInfo.firstName} onChange={e => setStudentInfo({ ...studentInfo, firstName: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }} />
                            <TextField label="Middle Name" fullWidth margin="normal" value={studentInfo.middleName} onChange={e => setStudentInfo({ ...studentInfo, middleName: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }} />
                            <TextField label="Last Name" required fullWidth margin="normal" value={studentInfo.lastName} onChange={e => setStudentInfo({ ...studentInfo, lastName: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }} />
                            <TextField label="Student ID" required fullWidth margin="normal" value={studentInfo.studentID} onChange={e => setStudentInfo({ ...studentInfo, studentID: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }} />
                        </DialogContent>
                        <DialogActions sx={{ p: '16px 24px' }}> {/* Ensure padding */}
                            <Button onClick={() => {
                                setShowRegisterDialog(false);
                                setStudentInfo({ firstName: '', middleName: '', lastName: '', studentID: '' }); // Clear info on cancel
                            }} color="error">Cancel</Button>
                            <Button onClick={handleRegister} color="primary" variant="contained">Submit Registration</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            {/* --- End Register for Event Dialog --- */}


            {/* --- Add Event Dialog (Remains the same) --- */}
            <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' } }}>
                <DialogTitle sx={{ color: darkMode ? '#eee' : 'inherit' }}>Add a New Event</DialogTitle>
                <DialogContent>
                    {/* Add dark mode styling to Dialog TextFields */}
                    <TextField label="Event Name" required fullWidth margin="normal" value={newEvent.event_name} onChange={e => setNewEvent({ ...newEvent, event_name: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="Abstract" fullWidth margin="normal" multiline rows={3} value={newEvent.abstract} onChange={e => setNewEvent({ ...newEvent, abstract: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="Event Date" required type="date" InputLabelProps={{ shrink: true, style: { color: darkMode ? '#aaa' : undefined } }} fullWidth margin="normal" value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="Location" required fullWidth margin="normal" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="Cost (Enter 0 if free)" type="number" fullWidth margin="normal" value={newEvent.cost} onChange={e => setNewEvent({ ...newEvent, cost: e.target.value })} InputLabelProps={{ style: { color: darkMode ? '#aaa' : undefined } }} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="Start Time" required type="time" InputLabelProps={{ shrink: true, style: { color: darkMode ? '#aaa' : undefined } }} fullWidth margin="normal" value={newEvent.time_from} onChange={e => setNewEvent({ ...newEvent, time_from: e.target.value })} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                    <TextField label="End Time" required type="time" InputLabelProps={{ shrink: true, style: { color: darkMode ? '#aaa' : undefined } }} fullWidth margin="normal" value={newEvent.time_to} onChange={e => setNewEvent({ ...newEvent, time_to: e.target.value })} inputProps={{ style: { color: darkMode ? '#fff' : undefined } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)' } } }}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAddDialog(false)} color="error">Cancel</Button>
                    <Button onClick={handleAddEvent} color="primary">Add Event</Button>
                </DialogActions>
            </Dialog>

            {/* --- Snackbar for Notifications --- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={snackbar.severity === 'info' ? 2000 : 4000} // Shorter for info messages
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* Severity needs to be correctly passed to Alert */}
                <Alert
                    severity={snackbar.severity || 'info'} // Default to info if severity is missing
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })} // Allow closing via X icon
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* --- Floating Action Button to Add Event --- */}
            <Fab
                color="primary"
                aria-label="add new event"
                sx={{ position: 'fixed', bottom: 30, right: 30 }} // Adjusted positioning slightly
                onClick={() => setShowAddDialog(true)}
            >
                <AddIcon />
            </Fab>

        </div>
    );
}

export default App;