"use client";

import { useEffect, useRef, useState } from "react";

type Note = {
  id: number;
  text: string;
  createdAt: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 최초 로드
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // 저장
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // 저장 / 수정
  const handleSave = () => {
    if (!text.trim()) return;

    if (editId !== null) {
      const updated = notes.map((n) =>
        n.id === editId ? { ...n, text } : n
      );
      setNotes(updated);
      setEditId(null);
    } else {
      const newNote: Note = {
        id: Date.now(),
        text,
        createdAt: new Date().toLocaleString(),
      };
      setNotes([newNote, ...notes]);
    }

    setText("");
    textareaRef.current?.focus();
  };

  // 삭제
  const handleDelete = (id: number) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // 수정
  const handleEdit = (note: Note) => {
    setText(note.text);
    setEditId(note.id);
  };

  // 🔥 AI 요약
  const handleSummarize = async () => {
    console.log("요약 버튼 클릭됨");

    if (!text.trim()) {
      console.log("입력 없음");
      return;
    }

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    console.log("응답 받음", res.status);

    const data = await res.json();
    
    setSummary(data.result);
  };

  // 검색 필터
  const filteredNotes = notes.filter((n) =>
    n.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ padding: "40px", maxWidth: "720px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>AI 메모장</h1>
      <p style={{ marginBottom: "20px" }}>
        흩어진 생각을 저장하는 첫 화면
      </p>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="아이디어를 입력해 보세요."
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          marginBottom: "12px",
        }}
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="메모 검색"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          marginBottom: "12px",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          {editId !== null ? "수정 완료" : "저장"}
        </button>

        {summary && (
            <div style={{ marginTop: "20px", padding: "12px", border: "1px solid #ddd" }}>
            <p>{summary}</p>
            </div>
        )}

        <button
          onClick={handleSummarize}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#4f46e5",
            color: "white",
            cursor: "pointer",
          }}
        >
          AI 요약
        </button>
      </div>

      <h3 style={{ marginBottom: "12px" }}>메모 목록</h3>

      {filteredNotes.length === 0 ? (
        <p style={{ color: "#777" }}>아직 저장된 메모가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredNotes.map((note) => (
            <li
              key={note.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ marginBottom: "6px" }}>{note.text}</div>
              <div style={{ fontSize: "12px", color: "#777" }}>
                {note.createdAt}
              </div>

              <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                <button onClick={() => handleEdit(note)}>수정</button>
                <button onClick={() => handleDelete(note.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}