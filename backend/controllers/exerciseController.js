const fs = require('fs');
const path = require('path');

const exercisesDataPath = path.join(__dirname, '..', 'data', 'exercises.json');

let exercises = [];
try {
  if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'));
  }
  if (fs.existsSync(exercisesDataPath)) {
    const data = fs.readFileSync(exercisesDataPath, 'utf8');
    exercises = JSON.parse(data);
  }
} catch (err) {
  console.error('Error loading exercises.json:', err);
}

const getBaseUrl = (req) => {
  const protocol = req.protocol;
  const host = req.get('host');
  // fallback for testing if BASE_URL is in env
  return process.env.BASE_URL || `${protocol}://${host}`;
};

exports.getAllExercises = (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const result = exercises.map(ex => ({
      ...ex,
      image: `${baseUrl}${ex.image}`
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

exports.getExerciseById = (req, res) => {
  try {
    const exercise = exercises.find(ex => ex.id === req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    
    res.json({
      ...exercise,
      image: `${getBaseUrl(req)}${exercise.image}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

exports.getExerciseByName = (req, res) => {
  try {
    const exercise = exercises.find(
      ex => ex.name.toLowerCase() === req.params.name.toLowerCase()
    );
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    
    res.json({
      ...exercise,
      image: `${getBaseUrl(req)}${exercise.image}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

exports.getExercisesByMuscle = (req, res) => {
  try {
    const filtered = exercises.filter(ex =>
      ex.musclesAffected.includes(req.params.muscle)
    );
    if (filtered.length === 0) return res.status(404).json({ error: 'No exercises found' });
    
    const baseUrl = getBaseUrl(req);
    const result = filtered.map(ex => ({
      ...ex,
      image: `${baseUrl}${ex.image}`
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};
