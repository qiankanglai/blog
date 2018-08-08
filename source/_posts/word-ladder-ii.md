---
layout: post
title: word ladder 2
date: 2013/11/5
tags: [C++,Java]
toc: false
---

I was blocked by [word ladder II](http://oj.leetcode.com/problems/word-ladder-ii/) in last two days. 

<!--more-->

I solve this problem with BFS building search graph + DFS build paths. However I tried my best optimizing but got Time Limit Exceeded (I've tried three ways of building path". After profiling, it seems in the building path part, copying ArrayList consumes too much time.

{% codeblock lang:java %}
public class Solution {
    public ArrayList<ArrayList<String>> buildPath(HashMap<String, ArrayList<ArrayList<String>>> cache, HashMap<String, ArrayList<String>> previous, String current, int steps){
        ArrayList<ArrayList<String>> c = cache.get(current);
        if(c != null){
            ArrayList<ArrayList<String>> copy = new ArrayList<ArrayList<String>>();
            for(ArrayList<String> c2 : c){
                copy.add((ArrayList<String>)c2.clone());
            }
            return copy;
        }

        c = new ArrayList<ArrayList<String>>();
        ArrayList<String> _p = previous.get(current);
        if(_p == null){
            ArrayList<String> s2 = new ArrayList<String>();
            s2.add(current);
            c.add(s2);
        }
        else{
            for(String _ps : _p){
                ArrayList<ArrayList<String>> c2 = buildPath(cache, previous, _ps, steps-1);
                c.addAll(c2);
            }
            for(ArrayList<String> p2 : c){
                p2.add(current);
            }
        }
        if(steps < 10){
            cache.put(current, c);

            ArrayList<ArrayList<String>> copy = new ArrayList<ArrayList<String>>();
            for(ArrayList<String> c2 : c){
                copy.add((ArrayList<String>)c2.clone());
            }
            return copy;
        }
        else
            return c;
    }

    public ArrayList<ArrayList<String>> findLadders(String start, String end, HashSet<String> dict) {
        dict.remove(start);
        dict.add(end);
        System.gc();

        HashMap<String, ArrayList<String>> previous = new HashMap<String, ArrayList<String>>();

        ArrayList<String> current = new ArrayList<String>(), next = new ArrayList<String>();
        current.add(start);
        int steps = 1;
        while(previous.get(end) == null && current.size() > 0){
            steps++;
            int size = current.size();
            for(int i = 0; i < size; i++){
                String s = current.get(i);
                int length = s.length();
                for(int l = 0; l < length; l++){
                    String _left = s.substring(0,l);
                    String _right = s.substring(l + 1, length);
                    for(char c = 'a';c <= 'z';c++){
                        String tmp = _left + c + _right;
                        if(dict.contains(tmp)){
                            next.add(tmp);
                            ArrayList<String> _p = previous.get(tmp);
                            if(_p == null){
                                _p = new ArrayList<String>();
                                previous.put(tmp, _p);
                            }
                            _p.add(s);
                        }
                    }
                }
            }
            dict.removeAll(next);

            ArrayList<String> tmp = current;
            current = next;
            next = tmp;
            tmp.clear();
        }
        
        if(previous.get(end) == null){
            ArrayList<String> s2 = new ArrayList<String>();
            ArrayList<ArrayList<String>> s = new ArrayList<ArrayList<String>>();
            s.add(s2);
            return s;
        }
        else{
            HashMap<String, ArrayList<ArrayList<String>>> cache = new HashMap<String, ArrayList<ArrayList<String>>>();
            buildPath(cache, previous, end, steps);
            return cache.get(end);
        }
    }
}
{% endcodeblock %}

After that I simply "translate" the code into C++ with stl, and got AC easily.

{% codeblock lang:cpp %}
class Solution {
public:
	void buildPath(unordered_map<string, vector<string>> &previous, vector<vector<string>> &result,
		vector<string> &path, string &current, string& target){
		if(current == target){
			vector<string> _p(path);
			_p.push_back(current);
			reverse(_p.begin(), _p.end());
			result.push_back(_p);
			return;
		}

		path.push_back(current);
		vector<string>& _previous = previous[current];
		for(vector<string>::iterator iter = _previous.begin(); iter != _previous.end(); iter++){
			buildPath(previous, result, path, *iter, target);
		}
		path.pop_back();
	}

    vector<vector<string>> findLadders(string start, string end, unordered_set<string> &dict) {
		dict.erase(start);
		dict.insert(end);
		
        unordered_map<string, vector<string>> previous;

        unordered_set<string> *current = new unordered_set<string>(), *next = new unordered_set<string>();
		current->insert(start);
        int steps = 1;
		while(previous.find(end) == previous.end() && current->size() > 0){
            steps++;
            for(unordered_set<string>::iterator iter = current->begin(); iter != current->end(); iter++){
                int length = iter->length();
                for(int l = 0; l < length; l++){
					string s2 = *iter;
                    for(char c = 'a';c <= 'z';c++){
						s2[l] = c;
						if(dict.find(s2) != dict.end()){
							next->insert(s2);
							previous[s2].push_back(*iter);
                        }
                    }
                }
            }
			for (unordered_set<string>::const_iterator iter = next->begin();  
                    iter != next->end(); iter++)  
                dict.erase(*iter);  

            unordered_set<string>* tmp = current;
            current = next;
            next = tmp;
            tmp->clear();
        }
		
		delete current;
		delete next;

		vector<vector<string>> result;
		vector<string> path;
		buildPath(previous, result, path, end, start);
		return result;
    }
};
{% endcodeblock %}