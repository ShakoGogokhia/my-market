<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use App\Models\Requirement;
use App\Models\WorkCondition;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VacancyController extends Controller
{
    public function index(Request $request)
    {
        $query = Vacancy::with(['requirements', 'workCondition']);

        if ($request->has('status')) {
            $status = $request->query('status');

            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        $vacancies = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json($vacancies);
        }

        return Inertia::render('admin/Vacancies', ['vacancies' => $vacancies]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'requirements' => 'nullable|array',
            'requirements.*.title' => 'required_with:requirements|string',
            'requirements.*.description' => 'required_with:requirements|string',
            'work_condition.title' => 'required|string',
            'work_condition.description' => 'required|string',
        ]);
    
        $vacancy = Vacancy::create([
            'title' => $data['title'],
            'description' => $data['description'],
        ]);
    
      
        $vacancy->workCondition()->create($data['work_condition']);
    
        return response()->json([
            'message' => 'Vacancy created successfuly',
            'vacancy' => $vacancy->load('requirements', 'workCondition'),
        ]);
    }
    

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'requirements' => 'nullable|array', 
            'requirements.*.title' => 'required_with:requirements|string',
            'requirements.*.description' => 'required_with:requirements|string',
            'work_condition.title' => 'required|string',
            'work_condition.description' => 'required|string',
        ]);
        
        $vacancy = Vacancy::findOrFail($id);
        $vacancy->update([
            'title' => $data['title'],
            'description' => $data['description'],
        ]);
        
        if (isset($data['requirements']) && is_array($data['requirements'])) {
            $vacancy->requirements()->delete();
            
            foreach ($data['requirements'] as $req) {
                $vacancy->requirements()->create($req);
            }
        }
        if ($vacancy->workCondition) {
            $vacancy->workCondition->update($data['work_condition']);
        } else {
            $vacancy->workCondition()->create($data['work_condition']);
        }
    
        return response()->json([
            'message' => 'Vacancy updated successfully.',
            'vacancy' => $vacancy->load('requirements', 'workCondition'),
        ]);
    }
    
    public function destroy($id)
    {
        Vacancy::findOrFail($id)->delete();
        return response()->json(['message' => 'Vacancy deleted']);
    }
}
